"use client";

import { Check, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Tool } from "./editor-toolbar";

type Props = {
  tool: Tool;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  fontFamily: string;
  onFontFamilyChange: (family: string) => void;
  highlightSize: number;
  onHighlightSizeChange: (n: number) => void;
  blurSize: number;
  onBlurSizeChange: (n: number) => void;
  cropMode?: boolean;
  onCancelCrop?: () => void;
  onApplyCrop?: () => void;
};

const FONT_FAMILIES = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Impact",
];


export function SecondaryToolbar({
  tool,
  fontSize,
  onFontSizeChange,
  highlightSize,
  onHighlightSizeChange,
  fontFamily,
  onFontFamilyChange,
  blurSize,
  onBlurSizeChange,
  cropMode = false,
  onCancelCrop,
  onApplyCrop,
}: Props) {
  // Crop mode takes priority — show Cancel / Apply for the active crop.
  if (cropMode) {
    return (
      <div className="border-b border-border bg-card/50">
        <div className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 px-4 py-3">
          <button
            type="button"
            onClick={onCancelCrop}
            className="flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" /> Cancel
          </button>
          <button
            type="button"
            onClick={onApplyCrop}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" /> Apply
          </button>
        </div>
      </div>
    );
  }

  if (tool !== "text" && tool !== "highlight" && tool !== "blur") return null;

  return (
    <div className="border-b border-border bg-card/50">
      <div className="mx-auto w-full max-w-sm px-4 py-3">
        {tool === "text" && (
          <div className="flex items-center gap-4">
            {/* Font family */}
            <div className="flex items-center gap-2">
              <Label className="shrink-0">Font</Label>
              <Select
                value={fontFamily}
                onValueChange={(v) => {
                  if (typeof v === "string") onFontFamilyChange(v);
                }}
              >
                <SelectTrigger className="h-8 w-40" style={{ fontFamily }}>
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Font size */}
            <div className="flex items-center gap-2 flex-1 min-w-[250px]">
              <Label className="shrink-0">Size</Label>
              <Slider
                value={[fontSize]}
                min={8}
                max={120}
                step={1}
                onValueChange={(v) => {
                  const next = Array.isArray(v) ? v[0] : v;
                  if (typeof next === "number") onFontSizeChange(next);
                }}
                className="flex-1"
              />
              <span className="text-xs tabular-nums text-muted-foreground shrink-0 w-8 text-right">
                {fontSize}
              </span>
            </div>
          </div>
        )}
        {tool === "highlight" && (
          <SliderField
            label="Highlight size"
            min={4}
            max={80}
            step={1}
            value={highlightSize}
            onChange={onHighlightSizeChange}
          />
        )}
        {tool === "blur" && (
          <SliderField
            label="Blur size"
            min={4}
            max={80}
            step={1}
            value={blurSize}
            onChange={onBlurSizeChange}
          />
        )}
      </div>
    </div>
  );
}

function SliderField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="shrink-0">{label}</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v;
          if (typeof next === "number") onChange(next);
        }}
        className="flex-1"
      />
      <span className="text-xs tabular-nums text-muted-foreground shrink-0 w-8 text-right">
        {value}
      </span>
    </div>
  );
}
