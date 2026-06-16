"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Circle as CircleIcon,
  Pen,
  Redo2,
  RotateCw,
  Square,
  Trash2,
  Type,
  Undo2, Crop, Highlighter, EyeOff,
    MousePointer2,   // ← add this line

} from "lucide-react";

import { cn } from "@/lib/utils";
import { SaveMenu } from "./save-menu";
import { FilenameEditor } from "./filename-editor";
import { BackgroundPopover } from "./background-dialog";
import type { ExportOptions } from "./fabric/canvas-actions";

export type Tool = "select" | "pen" | "text" | "blur" | "rect" | "highlight" | "circle" | "arrow";

const SHAPE_TOOLS = [
    { id: "select" as const, label: "Select", Icon: MousePointer2 },   // ← add this line

  { id: "pen" as const, label: "Pen", Icon: Pen },
  { id: "text" as const, label: "Text", Icon: Type },
  { id: "highlight" as const, label: "Highlight", Icon: Highlighter },
  { id: "blur" as const, label: "Blur", Icon: EyeOff },
  { id: "rect" as const, label: "Rectangle", Icon: Square },
  { id: "circle" as const, label: "Circle", Icon: CircleIcon },
  { id: "arrow" as const, label: "Arrow", Icon: ArrowUpRight },
];

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#a855f7", // purple
  "#111827", // black
];

type Props = {
  filename: string;
  onRename: (name: string) => void;
  tool: Tool;
  color: string;
  onTool: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: (opts: ExportOptions) => void;
  onRotate: () => void;
  onCrop: () => void;
  padding: number;
  bgColor: string;
  onPaddingChange: (padding: number) => void;
  onBgColorChange: (color: string) => void;
  setCornerRadius: (radius: number) => void;
  cornerRadius: number;
  cropMode?: boolean;
  canUndo: boolean;
canRedo: boolean;
bgGallery: string[];
bgActiveIndex: number | null;
onAddBg: (dataUrl: string) => void;
onRemoveBg: (index: number) => void;
onSelectBg: (index: number | null) => void;
onCancelCrop: () => void;
nativeWidth: number;
nativeHeight: number;
maxSafeWidth: number;
onMeasureSize?: (opts: ExportOptions) => number | null;
};

import { DiscardChangesDialog } from "./discard-changes";

export function EditorToolbar({
  filename,
  onRename,
  tool,
  color,
  onTool,
  onUndo,
  onRedo,
  onColorChange,
  onDelete,
  onCancel,
  onSave,
  onRotate,
  onCrop,
  padding,
  bgColor,
  bgGallery,
  bgActiveIndex,
  onPaddingChange,
  onBgColorChange,
  onAddBg,
  onRemoveBg,
  onSelectBg,
  setCornerRadius,
  cornerRadius,
  cropMode = false,
  canUndo,
  canRedo,
  onCancelCrop,
  nativeWidth,
  nativeHeight,
  maxSafeWidth,
  onMeasureSize,
}: Props) {
  const [showColors, setShowColors] = useState(false);
  const colorBtnRef = useRef<HTMLDivElement>(null);
  const [colorPopupStyle, setColorPopupStyle] = useState<React.CSSProperties>({});

  // Dismiss the color popup on any outside click/tap or Escape — it's a
  // hand-rolled popup (not the Popover primitive), so it gets no dismiss
  // behavior for free. The popup div lives inside colorBtnRef's wrapper,
  // so one contains() check covers both the trigger and the palette.
  useEffect(() => {
    if (!showColors) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!colorBtnRef.current?.contains(e.target as Node)) {
        setShowColors(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowColors(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [showColors]);

  const handleToolChange = (newTool: Tool) => {
    onTool(newTool);
  };

  const toggleColors = () => {
    setShowColors((prev) => {
      const next = !prev;
      if (next && colorBtnRef.current) {
        const rect = colorBtnRef.current.getBoundingClientRect();
        setColorPopupStyle({
          position: "fixed",
          top: rect.bottom + 8,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%)",
        });
      }
      return next;
    });
  };

  return (
    <div className="relative flex items-center gap-3 border-b border-border bg-card px-30 py-2 md:flex-wrap md:gap-4 md:px-4 md:py-3">
      <div className="hidden min-w-0 items-center gap-1 md:flex">
        <FilenameEditor value={filename} onRename={onRename} />
      </div>
      <div className="-mx-3 flex-1 overflow-x-auto scrollbar-hide px-3 md:mx-auto md:flex-none md:overflow-visible md:px-0">
        <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-background p-1 shadow-lg md:w-auto">
          {SHAPE_TOOLS.map(({ id, label, Icon }) => {
            const active = tool === id;
            return (
              <ToolButton
                key={id}
                label={label}
                active={active}
                onClick={() => handleToolChange(id)}
              >
                <Icon className={cn("size-4 md:size-5", active && "stroke-[2.5]")} />
              </ToolButton>
            );
          })}

          <div ref={colorBtnRef} className="relative">
            <ToolButton label="Color" onClick={toggleColors}>
              <span
                className="size-4 md:size-5 rounded-full border border-border"
                style={{ backgroundColor: color }}
              />
            </ToolButton>
            {showColors && (
              <div
                style={colorPopupStyle}
                className="z-50 rounded-xl border border-border bg-card p-2 shadow-lg"
              >
                <div className="flex items-center gap-1.5">
                  {COLORS.map((co) => (
                    <button
                      key={co}
                      type="button"
                      onClick={() => {
                        onColorChange(co);
                        setShowColors(false);
                      }}
                      className={cn(
                        "size-6 rounded-full border border-border transition-transform hover:scale-110",
                        color === co && "ring-2 ring-ring ring-offset-1",
                      )}
                      style={{ backgroundColor: co }}
                      title={co}
                    />
                  ))}
                  <span className="mx-0.5 h-5 w-px bg-border" />
                  <label
                    className="relative flex size-6 cursor-pointer items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
                    style={{
                      background:
                        "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
                    }}
                    title="Custom color"
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => onColorChange(e.target.value)}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
          <Divider />

          <ToolButton label="Undo" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="size-4 md:size-5" />
          </ToolButton>
          <ToolButton label="Redo" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="size-4 md:size-5" />
          </ToolButton>

          <Divider />
          <ToolButton label="Crop" active={cropMode} onClick={onCrop}>
            <Crop className={cn("size-4 md:size-5", cropMode && "stroke-[2.5]")} />
          </ToolButton>

          <ToolButton label="Rotate" onClick={onRotate}   
          className="[&_svg]:transition-transform 
          [&_svg]:duration-300 
          active:[&_svg]:rotate-90"
>
            <RotateCw className="size-4 md:size-5 " />
          </ToolButton>

          <BackgroundPopover
            padding={padding}
            bgColor={bgColor}
            bgGallery={bgGallery}
            bgActiveIndex={bgActiveIndex}
            onPaddingChange={onPaddingChange}
            onBgColorChange={onBgColorChange}
            onAddBg={onAddBg}
            onRemoveBg={onRemoveBg}
            onSelectBg={onSelectBg}
            cornerRadius={cornerRadius}
            setCornerRadius={setCornerRadius}
            onCancelCrop={onCancelCrop}
            cropMode={cropMode}
          />

          <ToolButton label="Delete" onClick={onDelete}>
            <Trash2 className="size-4 md:size-5" />
          </ToolButton>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:hidden lg:flex">
        <DiscardChangesDialog onConfirm={onCancel} />

        <SaveMenu
          onSave={onSave}
          filename={filename}
          nativeWidth={nativeWidth}
          nativeHeight={nativeHeight}
          maxSafeWidth={maxSafeWidth}
          onMeasureSize={onMeasureSize}
        />
      </div>
    </div>
  );
}

type ToolButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
};

function ToolButton({
  label,
  active = false,
  onClick,
  children,
  disabled = false,
  className
}: ToolButtonProps & {className?: string}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-all hover:bg-muted",
        active && "text-primary",
        (label === "Undo" || label === "Redo") &&
          !disabled &&
          "active:scale-100 active:bg-accent active:text-primary",
        disabled && (label === "Undo" || label === "Redo")
          ? "cursor-not-allowed opacity-50 hover:bg-transparent"
          : "",className
      )}
    >
      {children}
      <span className={cn(active && "font-semibold")}>{label}</span>
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-12 w-px bg-border" />;
}