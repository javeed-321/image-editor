// Minimal ambient types for upng-js (ships no types). We only use encode().
declare module "upng-js" {
  /**
   * Encode frames to PNG. cnum caps the palette size: 0 = lossless,
   * 256 = 8-bit palette (lossy, smallest). Returns the PNG bytes.
   */
  export function encode(
    imgs: ArrayBuffer[],
    w: number,
    h: number,
    cnum: number,
    dels?: number[],
  ): ArrayBuffer;

  const UPNG: { encode: typeof encode };
  export default UPNG;
}
