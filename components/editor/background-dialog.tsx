"use client";

import { useRef } from "react";

import { Frame, Upload, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn, STORAGE } from "@/lib/utils";

const BG_COLORS = [
  "#ffffff",
  "#f3f4f6",
  "#111827",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#ec4899",
];

type Props = {
  padding: number;
  bgColor: string;
  bgGallery: string[];
  bgActiveIndex: number | null;
  onAddBg: (dataUrl: string) => void;
  onRemoveBg: (index: number) => void;
  onSelectBg: (index: number | null) => void;
  onPaddingChange: (padding: number) => void;
  onBgColorChange: (color: string) => void;
  setCornerRadius: (radius: number) => void;
  cornerRadius: number;
  onCancelCrop: () => void,
  cropMode?: boolean;
};

export function BackgroundPopover({
  padding,
  bgColor,
  bgGallery,
  bgActiveIndex,
  onAddBg,
  onRemoveBg,
  onSelectBg,
  onPaddingChange,
  onBgColorChange,
  setCornerRadius,
  cornerRadius,
  onCancelCrop,
  cropMode
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (bgGallery.length >= STORAGE.BG_GALLERY_MAX) return;
    const reader = new FileReader();
    reader.onload = () => onAddBg(reader.result as string);
    reader.readAsDataURL(file);
  };


  return (
    <Popover>
      <PopoverTrigger
        className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted aria-expanded:text-primary aria-expanded:font-semibold [&[aria-expanded='true']_svg]:stroke-[2.5]"
        title="Background"
        onClick={() => { 
          if(cropMode) onCancelCrop() ;
        }}
      >
        <Frame className="size-5" />
        <span>Background</span>
      </PopoverTrigger>

      <PopoverContent align="center" side="bottom" className="w-80 p-4">
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Padding</label>
              <span className="text-sm text-muted-foreground">
                {padding} px
              </span>
            </div>
            <Slider
              value={[padding]}
              min={0}
              max={200}
              step={5}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                onPaddingChange(typeof next === "number" ? next : 0);
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Corner Radius</label>
              <span className="text-sm text-muted-foreground">
                {cornerRadius} px
              </span>
            </div>
            <Slider
              value={[cornerRadius]}
              min={0}
              max={200}
              step={2}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                setCornerRadius(typeof next === "number" ? next : 0);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium ">Color</label>
            <div className=" mt-2 flex flex-wrap items-center gap-1.5">
              {BG_COLORS.map((co) => (
                <button
                  key={co}
                  type="button"
                  onClick={() => onBgColorChange(co)}
                  className={cn(
                    "size-7 rounded-full border border-border hover:scale-110",
                    bgColor === co && "ring-2 ring-offset-1 bg-primary",
                  )}
                  style={{ backgroundColor: co }}
                  aria-label={co}
                />
              ))}
              <label
                className="relative flex size-7 cursor-pointer items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
                style={{
                  background:
                    "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
                }}
                title="Custom color"
                aria-label="Custom color"
              >
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="absolute inset-0 size-full cursor-pointer opacity-0"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium mr-2 mb-3">Background image</label>
            <div className="flex items-center gap-2 mt-2">
              {Array.from({ length: STORAGE.BG_GALLERY_MAX }, (_, i) => {
                const url = bgGallery[i];
                const isActive = bgActiveIndex === i;

                if (!url) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-20 flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground/50 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-sm"
                      title="Upload background"
                    >
                      <Upload className="size-5" />
                      <span className="text-[10px] font-medium leading-none">Add</span>
                    </button>
                  );
                }

                return (
                  <div key={i} className="group relative">
                    <button
                      type="button"
                      onClick={() => onSelectBg(isActive ? null : i)}
                      className={cn(
                        "size-20 overflow-hidden rounded-lg border-2 bg-cover bg-center transition-all",
                        isActive
                          ? "border-primary ring-2 ring-primary shadow-md"
                          : "border-border hover:border-muted-foreground hover:shadow-sm",
                      )}
                      style={{ backgroundImage: `url(${url})` }}
                      title={isActive ? "Click to unset" : "Use as background"}
                    />

                    <button
                      type="button"
                      onClick={() => onRemoveBg(i)}
className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-md ring-1 ring-border backdrop-blur-sm opacity-100 transition-all md:opacity-0 md:group-hover:opacity-100 hover:bg-foreground text-background hover:ring-0"
                      title="Remove"
                    >
                      <X className="size-2.5 stroke-[3]" />
                    </button>
                  </div>
                );
              })}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFile(e.target.files);
                e.target.value = ""; // allow re-uploading same file
              }}
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
  Click the selected image again to remove background.
            </p>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
}
