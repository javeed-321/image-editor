"use client";

import { ChevronDown, ChevronLeft, Download, Image as ImageIcon } from "lucide-react";
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
  /** Exact byte size the given settings would download, or null if unknown. */
  onMeasureSize?: (opts: ExportOptions) => number | null;
};

const FORMAT_META: Record<ExportFormat, { label: string }> = {
  png: { label: "PNG" },
  jpg: { label: "JPG" },
  jpeg: { label: "JPEG" },
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
  // Compressed PNG = 8-bit palette (≤256 colors) ≈ 1 B/px; lossless ≈ 3 B/px.
  if (format === "png") return Math.round(px * (compress ? 1 : 3));
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
  onMeasureSize,
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
  // Width as last *committed* (slider released / input blurred). The size
  // measurement keys off this, never the live drag value, so the expensive
  // full-res encode can't fire mid-drag and stutter the slider.
  const [committedWidth, setCommittedWidth] = useState<number>(maxWidth);

  // When the canvas (image) changes, reset width to the new source ceiling.
  useEffect(() => {
    setWidth(maxWidth);
    setWidthInput(String(maxWidth));
    setCommittedWidth(maxWidth);
  }, [maxWidth]);

  const aspect = nativeWidth > 0 ? nativeHeight / nativeWidth : 1;
  const outH = Math.round(width * aspect);
  const isJpeg = format === "jpg" || format === "jpeg";

  // Exact download size: encode the real export and measure it. Debounced,
  // and keyed to committedWidth so dragging the slider never encodes.
  // The result is stored WITH the settings it was measured at, so the UI
  // can tell "exact for what's selected" from "stale, interpolate instead".
  const [measured, setMeasured] = useState<{
    width: number;
    format: ExportFormat;
    compress: boolean;
    bytes: number;
  } | null>(null);
  useEffect(() => {
    if (!open || !onMeasureSize) return;
    const wantCompress = compress;
    const id = setTimeout(() => {
      const bytes = onMeasureSize({
        format,
        targetWidth: committedWidth,
        compress: wantCompress,
      });
      if (bytes !== null) {
        setMeasured({ width: committedWidth, format, compress: wantCompress, bytes });
      }
    }, 250);
    return () => clearTimeout(id);
  }, [open, format, committedWidth, compress, onMeasureSize]);

  // Size label: exact when we measured these exact settings; while dragging,
  // scale the last real measurement by pixel count (file size ≈ proportional
  // to pixels). When format/compress changed, compression ratio is unknown —
  // any interim number would flash wrong then jump, so say "calculating…"
  // and change the value once. Byte-per-pixel guess only without a measurer.
  const settingsMatch =
    measured !== null &&
    measured.format === format &&
    measured.compress === compress;
  const sizeLabel = settingsMatch
    ? measured.width === width
      ? formatBytes(measured.bytes)
      : `~${formatBytes((measured.bytes * width * width) / (measured.width * measured.width))}`
    : onMeasureSize
      ? "calculating…"
      : `~${formatBytes(estimateBytes(format, width, outH, compress))}`;
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
    setCommittedWidth(clamped);
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
      compress,
      transparent: !isJpeg && transparent,
    });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]">
        <Download className="size-4" />
        Download
        <ChevronDown className="size-3.5 opacity-60" />
      </PopoverTrigger>

      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[340px] gap-0 overflow-hidden rounded-xl p-0"
      >
        <div className="flex items-center gap-1.5 border-b border-border-muted px-2.5 py-2">
          <button
            type="button"
            aria-label="Back"
            onClick={() => setOpen(false)}
            className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <p className="text-sm font-semibold text-heading">Download</p>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              File type
            </label>
            <Select
              value={format}
              onValueChange={(v) => {
                if (typeof v === "string") setFormat(v as ExportFormat);
              }}
            >
              <SelectTrigger className="h-10 w-full rounded-lg">
                <span className="flex flex-1 items-center gap-2 text-left">
                  <ImageIcon className="size-4.5 shrink-0 text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {FORMAT_META[format].label}
                  </span>
                  {format === suggested && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Suggested
                    </span>
                  )}
                </span>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FORMAT_META) as ExportFormat[]).map((f) => (
                  <SelectItem key={f} value={f} className="py-1.5 pl-2">
                    <span className="flex items-center gap-2 text-sm">
                      {FORMAT_META[f].label}
                      {f === suggested && (
                        <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium text-muted-foreground">
                          Suggested
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground tabular-nums">
              Size ×{multiplier.toFixed(2)}
            </label>

            <div className="flex items-center gap-3">
              <Slider
                // Chunkier track for easier grabbing (default is a 4px line).
                className="flex-1 **:data-[slot=slider-track]:h-1.5!"
                value={[width]}
                min={minWidth}
                max={maxWidth}
                step={10}
                onValueChange={(v) => {
                  const next = Array.isArray(v) ? v[0] : v;
                  if (typeof next === "number") handleSlider(next);
                }}
                onValueCommitted={(v) => {
                  const next = Array.isArray(v) ? v[0] : v;
                  if (typeof next === "number") setCommittedWidth(next);
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
                className="h-8 w-20 rounded-lg text-right tabular-nums"
              />
            </div>

            <p className="text-xs text-muted-foreground tabular-nums">
              {width.toLocaleString()} × {outH.toLocaleString()} px ·{" "}
              {sizeLabel}
              {atCeiling && " · Source quality"}
            </p>
          </div>

          <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
              className="size-4 accent-primary"
            />
            {isJpeg
              ? "Compress file (lower quality)"
              : "Compress file (reduce colors, smaller)"}
          </label>
        </div>

        <div className="border-t border-border-muted p-4">
          <Button
            className="h-10 w-full rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-[0.99]"
            onClick={handleDownload}
          >
            Download
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
