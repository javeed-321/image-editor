"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCALE_PRESETS = [
  { label: "Original", scale: 1 },
  { label: "75%", scale: 0.75 },
  { label: "50%", scale: 0.5 },
  { label: "25%", scale: 0.25 },
];

type Props = {
  onSave: (width?: number, filename?: string) => void;
  filename?: string;
  /** Natural canvas dimensions (zoom = 1), used for size previews and the custom-width placeholder. */
  naturalWidth?: number;
  naturalHeight?: number;
  /** Where to open the panel relative to the button. */
  menuPlacement?: "top" | "bottom";
};

export function SaveMenu({
  onSave,
  filename = "",
  naturalWidth = 0,
  naturalHeight = 0,
  menuPlacement = "bottom",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [downloadFileName, setDownloadFileName] = useState(filename);
  const [customWidth, setCustomWidth] = useState("");

  // Reset filename + custom-width default each time the panel opens.
  // Done during render (not in an effect) so it runs before paint and avoids
  // the cascading-render the react-hooks lint rule flags.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDownloadFileName(filename || "untitled");
      setCustomWidth(naturalWidth ? String(naturalWidth) : "");
    }
  }

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

  const downloadAtScale = (scale: number) => {
    // scale === 1 → undefined width means "use natural canvas size" in fabric-canvas's save()
    const w = scale === 1 ? undefined : Math.round(scale * naturalWidth);
    onSave(w, downloadFileName);
    setOpen(false);
  };

 const MAX_EXPORT_PX = 8000;
const downloadCustom = () => {
  const w = Number(customWidth);
  if (!Number.isFinite(w) || w <= 0) return;
  const clamped = Math.min(Math.round(w), MAX_EXPORT_PX);
  onSave(clamped, downloadFileName);
  setOpen(false);
};


  const customWidthNum = Number(customWidth);
  const customValid = Number.isFinite(customWidthNum) && customWidthNum > 0;
  const customHeightPreview =
    customValid && naturalWidth
      ? Math.round((customWidthNum * naturalHeight) / naturalWidth)
      : 0;

  return (
    <div ref={wrapRef} className="relative inline-flex">
      <Button
        onClick={() => setOpen((v) => !v)}
        className="px-4 transition-colors hover:bg-primary/80"
      >
        <Download className="size-4" />
        Done
      </Button>

      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-30 w-72 rounded-xl border border-border bg-card p-3 shadow-lg ${menuPos}`}
        >
          <div className="space-y-1.5">
            <Label htmlFor="export-filename" className="text-xs">
              File name
            </Label>
            <Input
              id="export-filename"
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              placeholder="untitled"
              autoFocus
              className="h-8"
            />
          </div>

          <div className="mt-3 space-y-1">
            <Label className="text-xs">Scale</Label>
            <div className="-mx-1">
              {SCALE_PRESETS.map((p) => {
                const w = Math.round(p.scale * naturalWidth);
                const h = Math.round(p.scale * naturalHeight);
                return (
                  <button
                    key={p.label}
                    type="button"
                    role="menuitem"
                    onClick={() => downloadAtScale(p.scale)}
                    className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium">{p.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {naturalWidth ? `${w}×${h}` : ""}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            <Label htmlFor="custom-width" className="text-xs">
              Custom width
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  id="custom-width"
                  type="number"
                  min={1}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder={naturalWidth ? String(naturalWidth) : "1920"}
                  className="h-8 pr-8"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") downloadCustom();
                  }}
                />
                <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                  px
                </span>
              </div>
              <Button
                size="sm"
                onClick={downloadCustom}
                disabled={!customValid}
              >
                Download
              </Button>
            </div>
            {customValid && naturalWidth > 0 && (
              <p className="text-xs text-muted-foreground tabular-nums">
                {Math.round(customWidthNum)}×{customHeightPreview} (aspect locked)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
