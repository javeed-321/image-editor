import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";
import type { Tool } from "../editor-toolbar";

type Params = {
  tool: Tool;
  color: string;
  highlightSize: number;
  fabricRef: RefObject<fabric.Canvas | null>;
};

export function useCanvasTool({
  tool,
  color,
  highlightSize,
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
      const brush = new fabric.PencilBrush(c);
      brush.color = "white";
      brush.width = 19;
      brush.strokeLineCap = "round";
      c.freeDrawingBrush = brush;
    } else {
      c.isDrawingMode = false;
    }
  }, [tool, color, highlightSize, fabricRef]);
}
