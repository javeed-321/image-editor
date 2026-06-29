import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const BG_DIR = path.join(process.cwd(), "background-images");

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  // Prevent path traversal — only allow the bare filename
  const safe = path.basename(filename);
  const filePath = path.join(BG_DIR, safe);

  try {
    const data = await readFile(filePath);
    const ext = path.extname(safe).slice(1).toLowerCase();
    const mime = MIME[ext] ?? "image/png";
    return new NextResponse(data, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
