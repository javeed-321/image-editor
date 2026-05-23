"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Circle as CircleIcon,
  Download,
  Frame,
  Pen,
  Redo2,
  Square,
  Trash2,
  Type,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Tool = "select" | "pen" | "text" | "rect" | "circle" | "arrow";

const SHAPE_TOOLS = [
  { id: "pen" as const, label: "Pen", Icon: Pen },
  { id: "text" as const, label: "Text", Icon: Type },
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
  tool: Tool;
  color: string;
  onTool: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: () => void;
  onOpenBackground: () => void;
};

export function EditorToolbar({
  filename,
  tool,
  color,
  onTool,
  onUndo,
  onRedo,
  onColorChange,
  onDelete,
  onCancel,
  onSave,
  onOpenBackground,
}: Props) {
  const [showColors, setShowColors] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center gap-1 text-sm font-medium">
        <span className="max-w-[220px] truncate" title={filename}>
          {filename || "Untitled"}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </div>

      <div className="mx-auto flex flex-wrap items-center gap-1 rounded-2xl border border-border bg-background p-1 shadow-sm">
        {SHAPE_TOOLS.map(({ id, label, Icon }) => {
          const active = tool === id;
          return (
            <ToolButton
              key={id}
              label={label}
              active={active}
              onClick={() => onTool(id)}
            >
              <Icon className={cn("size-5", active && "stroke-[2.5]")} />
            </ToolButton>
          );
        })}

        <Divider />

        <ToolButton label="Undo" onClick={onUndo}>
          <Undo2 className="size-5" />
        </ToolButton>
        <ToolButton label="Redo" onClick={onRedo}>
          <Redo2 className="size-5" />
        </ToolButton>

        <Divider />

        <div className="relative">
          <ToolButton
            label="Color"
            onClick={() => setShowColors((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={showColors}
          >
            <span
              className="size-5 rounded-full border border-border"
              style={{ backgroundColor: color }}
            />
          </ToolButton>
          {showColors && (
            <div className="absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-xl border border-border bg-card p-2 shadow-lg">
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
                    aria-label={co}
                  />
                ))}
                <span className="mx-0.5 h-5 w-px bg-border" aria-hidden />
                <label
                  className="relative flex size-6 cursor-pointer items-center justify-center rounded-full border border-border transition-transform hover:scale-110"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #ef4444, #eab308, #22c55e, #3b82f6, #a855f7, #ef4444)",
                  }}
                  aria-label="Custom color"
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
        <ToolButton label="Background" onClick={onOpenBackground}>
          <Frame className="size-5" />
        </ToolButton>

        <ToolButton label="Delete" onClick={onDelete}>
          <Trash2 className="size-5" />
        </ToolButton>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <Button onClick={onSave} className="px-5">
          <Download className="size-4" />
          Save
        </Button>
      </div>
    </div>
  );
}

type ToolButtonProps = {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
} & React.AriaAttributes;

function ToolButton({
  label,
  active = false,
  onClick,
  children,
  ...aria
}: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted",
        active && "text-primary",
      )}
      {...aria}
    >
      {children}
      <span className={cn(active && "font-semibold")}>{label}</span>
      <span
        className={cn(
          "h-0.5 w-6 rounded-full",
          active ? "bg-primary" : "bg-transparent",
        )}
        aria-hidden
      />
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-8 w-px bg-border" aria-hidden />;
}
