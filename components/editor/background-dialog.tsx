"use client";

import { useRef } from "react";
import { Frame, ImageIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
  bgImageUrl: string | null;
  onPaddingChange: (padding: number) => void;
  onBgColorChange: (color: string) => void;
  onBgImageChange: (url: string | null) => void;
    setCornerRadius: (radius: number) => void;
  cornerRadius: number;

  
};

export function BackgroundPopover({
  padding,
  bgColor,
  bgImageUrl,
  onPaddingChange,
  onBgColorChange,
  onBgImageChange,
  setCornerRadius,
  cornerRadius,
  
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => onBgImageChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <Popover>
      <PopoverTrigger
        className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted aria-expanded:text-primary aria-expanded:font-semibold [&[aria-expanded='true']_svg]:stroke-[2.5]"
        title="Background"
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
              step={10}
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
              step={5}
              onValueChange={(v) => {
                const next = Array.isArray(v) ? v[0] : v;
                setCornerRadius(typeof next === "number" ? next : 0);
              }}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Color</label>
            <div className="flex flex-wrap items-center gap-1.5">
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
            <label className="text-sm font-medium mr-2">Background image</label>
            {bgImageUrl ? (
              <div className="flex items-center gap-3 rounded-lg border border-border p-2">
                <div
                  className="size-12 shrink-0 rounded-md border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${bgImageUrl})` }}
                />
                <div className="flex-1 text-xs text-muted-foreground">
                  Image set as background
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onBgImageChange(null)}
                  aria-label="Remove background image"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                Upload image
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files)}
            />
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="size-3" />
              Image is stretched to fill the framed area.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
