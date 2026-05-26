"use client";

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
}: Props) {
  if (tool !== "text" && tool !== "highlight") return null;

  return (
    <div className="border-b border-border bg-card/50">
      <div className="mx-auto w-full max-w-sm px-4 py-3">
        {tool === "text" && (
  <div className="flex items-center gap-3">
    {/* Font family */}
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground shrink-0">Font</span>
      <select
        value={fontFamily}
        onChange={(e) => onFontFamilyChange(e.target.value)}
        className="h-8 w-36 shrink-0 rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        style={{ fontFamily }}
      >
        {FONT_FAMILIES.map((f) => (
          <option key={f} value={f} style={{ fontFamily: f }}>
            {f}
          </option>
        ))}
      </select>
    </div>

    {/* B / I / U toggles */}
 

    {/* Font size */}
<div className="flex items-center gap-1.5 flex-1 min-w-[250px]">
        <span className="text-xs text-muted-foreground shrink-0">Size</span>
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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-sm text-muted-foreground">{value} px</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => {
          const next = Array.isArray(v) ? v[0] : v;
          if (typeof next === "number") onChange(next);
        }}
      />
    </div>
  );
}
