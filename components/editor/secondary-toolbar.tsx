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
import { useEffect, useRef, useState } from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";


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

  const rootRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null); // null = default centered
  const grab = useRef<{ dx: number; dy: number } | null>(null);

  // Snap back to the default top-center spot whenever the tool (or crop mode)
  // changes. The component stays mounted across text/highlight/blur switches,
  // so without this the next tool's pill would appear at the previous drag
  // position instead of at the top.
  useEffect(() => {
    setPos(null);
  }, [tool, cropMode]);

  const onPointerDown = (e: React.PointerEvent) => {
    const r = rootRef.current!.getBoundingClientRect();
    grab.current = { dx: e.clientX - r.left, dy: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId); // keep events even if pointer leaves the handle
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!grab.current) return;
    const parent = rootRef.current!.offsetParent as HTMLElement;
    const pr = parent.getBoundingClientRect();
    setPos({
      x: e.clientX - pr.left - grab.current.dx,
      y: e.clientY - pr.top - grab.current.dy,
    });
  };
  const onPointerUp = () => { grab.current = null; };

  // Crop mode takes priority — show Cancel / Apply for the active crop.
  if (cropMode) {
    return (
      <div
        ref={rootRef}
        style={pos ? { left: pos.x, top: pos.y } : undefined}
        className={cn(
          "absolute z-30 flex items-center rounded-full border border-border bg-card/95 shadow-lg backdrop-blur",
          !pos && "left-1/2 top-2 -translate-x-1/2", // only center until first drag
        )}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex cursor-grab items-center self-stretch pl-2 active:cursor-grabbing touch-none"
          title="Drag to move"
        >
          <GripVertical className="size-4 text-muted-foreground" />
        </div>

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
    // floating pill. Same controls either way. Drag by the grip handle.
    <div
      ref={rootRef}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      className={cn(
        "absolute z-30 flex items-center w-max max-w-[calc(100%-1.5rem)] rounded-2xl border border-border bg-card/95 shadow-lg backdrop-blur sm:rounded-full",
        !pos && "left-1/2 top-3 -translate-x-1/2", // only center until first drag
      )}
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex cursor-grab items-center self-stretch pl-3 active:cursor-grabbing touch-none"
        title="Drag to move"
      >
        <GripVertical className="size-4 text-muted-foreground" />
      </div>
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
