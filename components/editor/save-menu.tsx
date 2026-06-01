"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import type { ExportFormat, ExportOptions } from "./fabric/canvas-actions";

type Props = {
  onSave: (opts: ExportOptions) => void;
  filename?: string;
  /** Canvas native (logical) width — the "1×" output size shown to the user. */
  nativeWidth: number;
  /** Canvas native (logical) height. */
  nativeHeight: number;
  /** Hard cap on output width before the user image starts pixelating. */
  maxSafeWidth: number;
};

// Match the uploaded file's format so a JPG photo round-trips as JPG (≈10×
// smaller files than PNG) and a PNG screenshot stays PNG (no JPG artifacts).
function suggestFormat(filename: string): ExportFormat {
  const ext = filename.toLowerCase().match(/\.(\w+)$/)?.[1];
  if (ext === "jpg") return "jpg";
  if (ext === "jpeg") return "jpeg";
  return "png";
}

// Rough output-size estimate. PNG of a photo ≈ 3 B/px (mostly incompressible);
// JPG ≈ 0.3 B/px at q0.92, 0.1 B/px at q0.6. Rough but order-of-magnitude right.
function estimateBytes(
  format: ExportFormat,
  w: number,
  h: number,
  compress: boolean,
): number {
  const px = w * h;
  if (format === "png") return Math.round(px * 3);
  return Math.round(px * (compress ? 0.1 : 0.3));
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function SaveMenu({
  onSave,
  filename = "",
  nativeWidth,
  nativeHeight,
  maxSafeWidth,
}: Props) {
  const [open, setOpen] = useState(false);
  const suggested = suggestFormat(filename);
  const [format, setFormat] = useState<ExportFormat>(suggested);
  const [compress, setCompress] = useState(false);
  const [transparent, setTransparent] = useState(false);

  // Re-sync the default when the user uploads a new file.
  useEffect(() => {
    setFormat(suggested);
  }, [suggested]);

  const minWidth = Math.max(100, Math.round(nativeWidth * 0.25));
  const maxWidth = Math.max(minWidth + 1, Math.round(maxSafeWidth));

  // Default to the source-resolution ceiling so exports match the uploaded
  // image's sharpness 1:1.
  const [width, setWidth] = useState<number>(maxWidth);
  // Text input is a separate string so the user can type freely without
  // every keystroke clamping mid-edit (e.g. "12" while aiming for "1200").
  const [widthInput, setWidthInput] = useState<string>(String(maxWidth));

  // When the canvas (image) changes, reset width to the new source ceiling.
  useEffect(() => {
    setWidth(maxWidth);
    setWidthInput(String(maxWidth));
  }, [maxWidth]);

  const aspect = nativeWidth > 0 ? nativeHeight / nativeWidth : 1;
  const outH = Math.round(width * aspect);
  const isJpeg = format === "jpg" || format === "jpeg";
  const atCeiling = width >= maxWidth;
  // Multiplier shown to the user — relative to the canvas's native size.
  // ×1 = "what you see on screen", ×N = N times bigger (clamped at source).
  const multiplier = nativeWidth > 0 ? width / nativeWidth : 1;

  const commitWidth = (raw: string) => {
    const n = Math.round(Number(raw));
    if (!Number.isFinite(n) || n <= 0) {
      setWidthInput(String(width));
      return;
    }
    const clamped = Math.max(minWidth, Math.min(maxWidth, n));
    setWidth(clamped);
    setWidthInput(String(clamped));
  };

  const handleSlider = (n: number) => {
    setWidth(n);
    setWidthInput(String(n));
  };

  const handleDownload = () => {
    onSave({
      filename: filename || "untitled",
      format,
      targetWidth: width,
      compress: isJpeg && compress,
      transparent: !isJpeg && transparent,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80">
        <Download className="size-4" />
        Download
      </PopoverTrigger>

      <PopoverContent align="end" side="bottom" className="w-80 gap-4 p-4">
        <div className="flex items-center gap-2 border-b border-border pb-2 font-medium">
          <Download className="size-4" />
          Download
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            File type
          </label>
          <Select
            value={format}
            onValueChange={(v) => {
              if (typeof v === "string") setFormat(v as ExportFormat);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
              {format === suggested && (
                <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  Suggested
                </span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">
                PNG{suggested === "png" && " · Suggested"}
              </SelectItem>
              <SelectItem value="jpg">
                JPG{suggested === "jpg" && " · Suggested"}
              </SelectItem>
              <SelectItem value="jpeg">
                JPEG{suggested === "jpeg" && " · Suggested"}
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">
            {format === "png"
              ? "PNG keeps every pixel — best for screenshots & graphics."
              : "JPG is ~10× smaller — best for photos."}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Size
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              ×{multiplier.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Slider
              className="flex-1"
              value={[width]}
              min={minWidth}
              max={maxWidth}
              step={10}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                if (typeof next === "number") handleSlider(next);
              }}
            />
            <Input
              type="number"
              inputMode="numeric"
              min={minWidth}
              max={maxWidth}
              value={widthInput}
              onChange={(e) => setWidthInput(e.target.value)}
              onBlur={(e) => commitWidth(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  commitWidth((e.target as HTMLInputElement).value);
                }
              }}
              className="h-8 w-20 text-right"
            />
          </div>

          <p className="text-[11px] text-muted-foreground tabular-nums">
            {width.toLocaleString()} × {outH.toLocaleString()} px · ~
            {formatBytes(estimateBytes(format, width, outH, isJpeg && compress))}
            {atCeiling && " · source quality"}
          </p>
        </div>

        {isJpeg ? (
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
              className="size-4 accent-primary"
            />
            Compress (smaller file)
          </label>
        ) : (
          <>
          
          </>
        )}

        <Button 
          className="w-full transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"

        onClick={handleDownload}>
          <Download className="size-4" />
          Download
        </Button>
      </PopoverContent>
    </Popover>
  );
}
