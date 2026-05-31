"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
  /** Canvas native (logical) width — the "1:1" output size. */
  nativeWidth: number;
  /** Canvas native (logical) height. */
  nativeHeight: number;
  /** Hard cap on output width before the user image starts pixelating. */
  maxSafeWidth: number;
};

export function SaveMenu({
  onSave,
  filename = "",
  nativeWidth,
  nativeHeight,
  maxSafeWidth,
}: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("png");
  const [compress, setCompress] = useState(false);

  const minWidth = Math.max(100, Math.round(nativeWidth * 0.25));
  const maxWidth = Math.max(minWidth + 1, Math.round(maxSafeWidth));

  // Default to the source-resolution ceiling so exports match the uploaded
  // image's sharpness 1:1. The cap itself is `canvasNativeWidth / image.scaleX`
  // — the largest width before Fabric would upscale and pixelate.
  const [width, setWidth] = useState<number>(maxWidth);

  // When the canvas (image) changes, reset width to the new source ceiling.
  useEffect(() => {
    setWidth(maxWidth);
  }, [maxWidth]);

  const aspect = nativeWidth > 0 ? nativeHeight / nativeWidth : 1;
  const outH = Math.round(width * aspect);
  const isJpeg = format === "jpg" || format === "jpeg";
  const atCeiling = width >= maxWidth;

  const handleDownload = () => {
    onSave({
      filename: filename || "untitled",
      format,
      targetWidth: width,
      compress: isJpeg && compress,
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
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpg">JPG</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Size
            </label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {width.toLocaleString()} × {outH.toLocaleString()} px
            </span>
          </div>
          <Slider
            value={[width]}
            min={minWidth}
            max={maxWidth}
            step={10}
            onValueChange={(v) => {
              const next = Array.isArray(v) ? v[0] : v;
              if (typeof next === "number") setWidth(next);
            }}
          />
          {atCeiling && (
            <p className="text-[11px] text-muted-foreground">
              Max size — going higher would pixelate the image.
            </p>
          )}
        </div>

        {isJpeg && (
          <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={compress}
              onChange={(e) => setCompress(e.target.checked)}
              className="size-4 accent-primary"
            />
            Compress (smaller file)
          </label>
        )}

        <Button className="w-full" onClick={handleDownload}>
          <Download className="size-4" />
          Download
        </Button>
      </PopoverContent>
    </Popover>
  );
}
