"use client";

import { Check, CrossIcon, Delete, DeleteIcon, Trash, Trash2, X } from "lucide-react";
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
  /** Dismiss the pill (parent switches back to the select tool). */
  onClose?: () => void;
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
  onClose,
}: Props) {
  // Crop mode takes priority — show Cancel / Apply for the active crop.
  if (cropMode) {
    return (
      <div className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full border border-border bg-card/95 shadow-lg backdrop-blur">
        <div className="flex w-max max-w-[90vw] items-center justify-center gap-2 px-4 py-2">
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
    // Mobile: compact centered card with stacked controls; sm+: one-line
    // floating pill. Same controls either way.
    <div className="absolute left-1/2 top-3 z-30 w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur sm:rounded-full">
      <div className="flex items-center gap-3 px-4 py-2.5 sm:max-w-[90vw] sm:px-5">
        {tool === "text" && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {/* Font family */}
            <div className="flex w-64 items-center gap-2 sm:w-auto">
              <Label className="shrink-0">Font</Label>
              <Select
                value={fontFamily}
                onValueChange={(v) => {
                  if (typeof v === "string") onFontFamilyChange(v);
                }}
              >
                <SelectTrigger className="h-8 w-full min-w-0 flex-1 sm:w-40 sm:flex-none" style={{ fontFamily }}>
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
            <div className="flex w-64 items-center gap-2 sm:w-auto sm:min-w-[250px] sm:flex-1">
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
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="-mr-2 mt-1 flex size-6 shrink-0 items-center justify-center self-start rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:mt-0 sm:self-center"
          >
            <X className="size-3.5" />
          </button>
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
    // Explicit width (compact on mobile): inside the w-max floating pill
    // there's no full-width parent for flex-1 to fill.
    <div className="flex w-64 items-center gap-2 sm:w-80">
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
