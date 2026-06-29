// Minimal PKZIP encoder — uncompressed (store method), no dependencies.
// Supports arbitrary binary files and UTF-8 filenames.

function makeCrc32Table(): Uint32Array {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    t[i] = c;
  }
  return t;
}

const CRC_TABLE = makeCrc32Table();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16le(n: number): [number, number] {
  return [n & 0xff, (n >> 8) & 0xff];
}

function u32le(n: number): [number, number, number, number] {
  return [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
}

function concat(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((s, c) => s + c.byteLength, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.byteLength; }
  return out;
}

function bytes(...vals: (number | number[])[]): Uint8Array {
  return new Uint8Array(vals.flat());
}

export async function buildZip(
  files: { filename: string; blob: Blob }[],
): Promise<Blob> {
  const enc = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  const offsets: number[] = [];
  let localOffset = 0;

  for (const { filename, blob } of files) {
    const data = new Uint8Array(await blob.arrayBuffer());
    const name = enc.encode(filename);
    const crc = crc32(data);
    const size = data.byteLength;

    offsets.push(localOffset);

    // Local file header (4.3.7)
    const local = bytes(
      0x50, 0x4b, 0x03, 0x04,   // signature
      ...u16le(20),              // version needed
      ...u16le(0),               // general purpose bit flag
      ...u16le(0),               // compression method: store
      ...u16le(0),               // last mod time
      ...u16le(0),               // last mod date
      ...u32le(crc),
      ...u32le(size),            // compressed size
      ...u32le(size),            // uncompressed size
      ...u16le(name.byteLength),
      ...u16le(0),               // extra field length
    );

    localParts.push(local, name, data);
    localOffset += local.byteLength + name.byteLength + size;
  }

  // Central directory (4.3.12)
  for (let i = 0; i < files.length; i++) {
    const { filename, blob } = files[i];
    const name = enc.encode(filename);
    const data = new Uint8Array(await blob.arrayBuffer());
    const crc = crc32(data);
    const size = data.byteLength;

    centralParts.push(bytes(
      0x50, 0x4b, 0x01, 0x02,   // signature
      ...u16le(20),              // version made by
      ...u16le(20),              // version needed
      ...u16le(0),               // general purpose bit flag
      ...u16le(0),               // compression method
      ...u16le(0),               // last mod time
      ...u16le(0),               // last mod date
      ...u32le(crc),
      ...u32le(size),
      ...u32le(size),
      ...u16le(name.byteLength),
      ...u16le(0),               // extra field length
      ...u16le(0),               // file comment length
      ...u16le(0),               // disk number start
      ...u16le(0),               // internal file attributes
      ...u32le(0),               // external file attributes
      ...u32le(offsets[i]),      // relative offset of local header
    ), name);
  }

  const centralData = concat(centralParts);
  const centralSize = centralData.byteLength;
  const count = files.length;

  // End of central directory record (4.3.16)
  const eocd = bytes(
    0x50, 0x4b, 0x05, 0x06,     // signature
    ...u16le(0),                  // disk number
    ...u16le(0),                  // disk with start of central dir
    ...u16le(count),
    ...u16le(count),
    ...u32le(centralSize),
    ...u32le(localOffset),
    ...u16le(0),                  // comment length
  );

  return new Blob(
    [concat(localParts), centralData, eocd] as BlobPart[],
    { type: "application/zip" },
  );
}
