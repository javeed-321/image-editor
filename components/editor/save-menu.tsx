"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ExportSize = {
  label: string;
  /** Target width in pixels. 0 = export at the canvas's natural size. */
  w: number;
  /** Display-only height; aspect ratio is preserved from the canvas. */
  h: number;
};

export const EXPORT_SIZES: ExportSize[] = [
  { label: "Original", w: 0, h: 0 },
  { label: "Instagram Post", w: 1080, h: 1080 },
  { label: "Instagram Story", w: 1080, h: 1920 },
  { label: "Twitter / X Post", w: 1200, h: 675 },
  { label: "YouTube Thumbnail", w: 1280, h: 720 },
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "Facebook Cover", w: 1200, h: 630 },
];

type Props = {
  onSave: (width?: number, filename?: string) => void;
  sizes?: ExportSize[];
  filename?: string;
  /** Where to open the panel relative to the button. */
  menuPlacement?: "top" | "bottom";
};

export function SaveMenu({
  onSave,
  sizes = EXPORT_SIZES,
  filename = "",
  menuPlacement = "bottom",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [downloadFileName, setDownloadFileName] = useState(filename);

  // Reset filename to current image name each time the panel opens.
  useEffect(() => {
    if (open) setDownloadFileName(filename || "untitled");
  }, [open, filename]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const menuPos =
    menuPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2";

  const pick = (w: number) => {
    onSave(w || undefined, downloadFileName);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <Button onClick={() => setOpen((v) => !v)} className="px-4">
        <Download className="size-4" />
        Save
      </Button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-30 w-64 rounded-xl border border-border bg-card p-3 shadow-lg ${menuPos}`}
        >
          <div className="space-y-1.5">
            <Label htmlFor="export-filename" className="text-xs">
              File name
            </Label>
            <div className="flex items-center rounded-md border border-border bg-background focus-within:ring-2 focus-within:ring-ring">
              <Input
                id="export-filename"
                value={downloadFileName}
                onChange={(e) => setDownloadFileName(e.target.value)}
                placeholder="untitled"
                autoFocus
                className="h-8 border-0 shadow-none focus-visible:ring-0"
              />
              {/* <span className="pr-2 text-xs text-muted-foreground">.png</span> */}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <Label className="text-xs">Size</Label>
            <div className="-mx-1">
              {sizes.map((size) => (
                <button
                  key={size.label}
                  type="button"
                  role="menuitem"
                  onClick={() => pick(size.w)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <span className="font-medium">{size.label}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {size.w ? `${size.w}×${size.h}` : "As is"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
