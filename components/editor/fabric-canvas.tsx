"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Button } from "@/components/ui/button";

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: 800,
      height: 500,
      backgroundColor: "#ffffff",
    });
    fabricRef.current = canvas;
    setReady(true);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []);

  const addRect = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const rect = new fabric.Rect({
      left: 80,
      top: 80,
      width: 140,
      height: 90,
      fill: "#6366f1",
      rx: 8,
      ry: 8,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.requestRenderAll();
  };

  const addCircle = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const circle = new fabric.Circle({
      left: 280,
      top: 120,
      radius: 55,
      fill: "#10b981",
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
    canvas.requestRenderAll();
  };

  const addText = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    const text = new fabric.IText("Edit me", {
      left: 120,
      top: 240,
      fontSize: 40,
      fill: "#111827",
      fontFamily: "sans-serif",
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.requestRenderAll();
  };

  const deleteSelected = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.getActiveObjects().forEach((obj) => canvas.remove(obj));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const clearAll = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.remove(...canvas.getObjects());
    canvas.requestRenderAll();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" onClick={addRect} disabled={!ready}>
          Add Rectangle
        </Button>
        <Button size="sm" onClick={addCircle} disabled={!ready}>
          Add Circle
        </Button>
        <Button size="sm" onClick={addText} disabled={!ready}>
          Add Text
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={deleteSelected}
          disabled={!ready}
        >
          Delete Selected
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={clearAll}
          disabled={!ready}
        >
          Clear
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border shadow-sm">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
