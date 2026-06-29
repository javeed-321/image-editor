import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

const BG_DIR = path.join(process.cwd(), "background-images");

export async function GET() {
  const entries = await readdir(BG_DIR);
  const images = entries.filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
  return NextResponse.json({ files: images });
}
