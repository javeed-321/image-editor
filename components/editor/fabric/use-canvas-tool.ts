import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";
import type { Tool } from "../editor-toolbar";

type Params = {
  tool: Tool;
  color: string;
  highlightSize: number;
  blurSize: number;
  fabricRef: RefObject<fabric.Canvas | null>;
};

export function useCanvasTool({
  tool,
  color,
  highlightSize,
  blurSize,
  fabricRef,
}: Params) {
  useEffect(() => {
    const c = fabricRef.current;
    if (!c) return;

    if (tool === "pen") {
      c.isDrawingMode = true;
      const brush = new fabric.PencilBrush(c);
      brush.color = color;
      brush.width = 4;
      c.freeDrawingBrush = brush;
    } else if (tool === "highlight") {
      c.isDrawingMode = true;
      const brush = new fabric.PencilBrush(c);
      brush.color = "rgba(253, 224, 71, 0.4)";
      brush.width = highlightSize;
      c.freeDrawingBrush = brush;
    } else if (tool === "blur") {
  c.isDrawingMode = true;

  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 16;
  patternCanvas.height = 16;
  const pCtx = patternCanvas.getContext("2d")!;

  const colors = [
    "#c4c8cb", "#d1cfc9", "#b8bdb5", "#cfd3d6",
    "#bfb9b3", "#d6d9dc", "#c9cec6", "#d4cfc8",
    "#cdd1c9", "#c0c5c9", "#d8d4ce", "#c6cbc3",
    "#d2d6d3", "#c8c2bc", "#cbd0d4", "#d0d5cf",
  ];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      pCtx.fillStyle = colors[row * 4 + col];
      pCtx.fillRect(col * 4, row * 4, 4, 4);
    }
  }

  const brush = new fabric.PatternBrush(c);
  brush.source = patternCanvas;
  brush.width = blurSize;
  brush.strokeLineCap = "round";
  c.freeDrawingBrush = brush;
} else {
      c.isDrawingMode = false;
    }
  }, [tool, color, highlightSize, blurSize, fabricRef]);
}
