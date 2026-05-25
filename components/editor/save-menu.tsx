"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

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
  onSave: (width?: number) => void;
  sizes?: ExportSize[];
  /** Whether the menu should open upwards (e.g. for the mobile bottom bar). */
  menuPlacement?: "top" | "bottom";
  filename:string ;
};

export function SaveMenu({
  onSave,
  sizes = EXPORT_SIZES,
  menuPlacement = "bottom",
filename
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const menuPos =
    menuPlacement === "top"
      ? "bottom-full mb-2"
      : "top-full mt-2";

  return (
    <div ref={wrapRef} className="relative inline-flex bg-transparent">
      <Button onClick={() => setOpen((v) => !v)} className="px-4">
        <Download className="size-4" />
        Save
      </Button>
     { /* <Button
        type="button"
        className="rounded-l-none border-l border-primary-foreground/30 px-2 mr-0"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Save options"
      >
        <ChevronDown className="size-4 -ml-3" />
      </Button> */ }
      {open && (
        <div
          role="menu"
          className={`absolute right-0 z-30 w-56 overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg ${menuPos}`}
        >
          <input value={filename}  />
          {sizes.map((size) => (
            <button
              key={size.label}
              type="button"
              role="menuitem"
              className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-muted"
              onClick={() => {
                setOpen(false);
                onSave(size.w || undefined);
              }}
            >
              <span>{size.label}</span>
              <span className="text-xs text-muted-foreground">
                {size.w ? `${size.w}×${size.h}` : "As is"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
