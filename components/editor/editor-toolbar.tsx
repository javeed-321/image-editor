"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Circle as CircleIcon,
  Download,
  Pen,
  Redo2,
  RotateCw,
  Square,
  Trash2,
  Type,
  Undo2, Crop, Highlighter, EyeOff
} from "lucide-react";

import { cn } from "@/lib/utils";
import { SaveMenu } from "./save-menu";
import { BackgroundPopover } from "./background-dialog";

export type Tool = "select" | "pen" | "text" | "blur" | "rect" | "highlight" | "circle" | "arrow";

const SHAPE_TOOLS = [
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
  tool: Tool;
  color: string;
  onTool: (tool: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  onCancel: () => void;
  onSave: (targetW?: number, filename?: string) => void;
  onRotate: () => void;
  onCrop: () => void;
  padding: number;
  bgColor: string;
  bgImageUrl: string | null;
  onPaddingChange: (padding: number) => void;
  onBgColorChange: (color: string) => void;
  onBgImageChange: (url: string | null) => void;
};
import { DiscardChangesDialog } from "./discard-changes";

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
  onRotate,
  onCrop,
  padding,
  bgColor,
  bgImageUrl,
  onPaddingChange,
  onBgColorChange,
  onBgImageChange,
}: Props) {
  const [showColors, setShowColors] = useState(false);
  const colorBtnRef = useRef<HTMLDivElement>(null);
  const [colorPopupStyle, setColorPopupStyle] = useState<React.CSSProperties>({});

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
    <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2 md:flex-wrap md:gap-4 md:px-4 md:py-3">
      <div className="hidden min-w-0 items-center gap-1 text-sm font-medium md:flex">
        <span
          className="max-w-[220px] truncate"
          title={filename}
        >
          {filename || "Untitled"}
        </span>
        {/* <ChevronDown className="size-4 shrink-0 text-muted-foreground" /> */}
      </div>

      <div className="-mx-3 flex-1 overflow-x-auto scrollbar-hide  px-3 md:mx-auto md:flex-none md:overflow-visible md:px-0">
        <div className="inline-flex items-center  gap-1 rounded-2xl border border-border bg-background p-1 shadow-lg md:w-auto ">
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

          <div ref={colorBtnRef} className="relative">
            <ToolButton
              label="Color"
              onClick={toggleColors}
              aria-haspopup="menu"
              aria-expanded={showColors}
            >
              <span
                className="size-5 rounded-full border border-border"
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
          <Divider />

          <ToolButton label="Undo" onClick={onUndo}>
            <Undo2 className="size-5" />
          </ToolButton>
          <ToolButton label="Redo" onClick={onRedo}>
            <Redo2 className="size-5" />
          </ToolButton>

          <Divider />
          <ToolButton label="Crop" onClick={onCrop}>
            <Crop className="size-5" />
          </ToolButton>


          <ToolButton label="Rotate" onClick={onRotate}>
            <RotateCw className="size-5" />
          </ToolButton>

          <BackgroundPopover
            padding={padding}
            bgColor={bgColor}
            bgImageUrl={bgImageUrl}
            onPaddingChange={onPaddingChange}
            onBgColorChange={onBgColorChange}
            onBgImageChange={onBgImageChange}
          />

          <ToolButton label="Delete" onClick={onDelete}>
            <Trash2 className="size-5" />
          </ToolButton>
        </div>
      </div>

      <div className="hidden items-center gap-3 md:hidden lg:flex">
        <DiscardChangesDialog onConfirm={onCancel} />

        <SaveMenu onSave={onSave} filename={filename} />
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
      title={label}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted",
        active && cn("text-primary",)
      )}
      {...aria}

    >
      {children}
      <span className={cn(active && "font-semibold")}>{label}</span>
      {/* <span
        className={cn(
          "h-0.5 w-6 rounded-full",
          active ? "bg-danger" : "bg-transparent",
        )}
        aria-hidden
      /> */}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-12 w-px bg-border" aria-hidden />;
}
