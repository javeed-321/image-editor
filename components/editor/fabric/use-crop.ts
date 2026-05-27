import { useCallback, useRef, useState, type RefObject } from "react";
import * as fabric from "fabric";

type Params = {
  fabricRef: RefObject<fabric.Canvas | null>;
  userImageRef: RefObject<fabric.FabricImage | null>;
  fitRef: RefObject<() => void>;
  pushHistory: () => void;
};

export function useCrop({
  fabricRef,
  userImageRef,
  fitRef,
  pushHistory,
}: Params) {
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const [cropMode, setCropMode] = useState(false);

  const enterCrop = useCallback(() => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    if (!c || !img || cropMode) return;

    c.isDrawingMode = false;
    c.discardActiveObject();

    const b = img.getBoundingRect();
    const rect = new fabric.Rect({
      left: b.left,
      top: b.top,
      width: b.width,
      height: b.height,
      originX: "left",
      originY: "top",
      centeredScaling: false,
      centeredRotation: false,
      lockScalingFlip: true,
      fill: "rgba(59,130,246,0.08)",
      stroke: "#3b82f6",
      strokeDashArray: [6, 4],
      strokeWidth: 2,
      strokeUniform: true,
      cornerColor: "#3b82f6",
      cornerStyle: "circle",
      transparentCorners: false,
      lockRotation: true,
      hasRotatingPoint: false,
    });

    c.add(rect);
    c.setActiveObject(rect);
    cropRectRef.current = rect;
    setCropMode(true);
    // c.isDrawingMode=true;
  }, [fabricRef, userImageRef, cropMode]);

  const cancelCrop = useCallback(() => {
    const c = fabricRef.current;
    const rect = cropRectRef.current;
    if (!c || !rect) return;
    c.remove(rect);
    c.requestRenderAll();
    cropRectRef.current = null;
    setCropMode(false);
  }, [fabricRef]);

  const applyCrop = useCallback(() => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    const rect = cropRectRef.current;
    if (!c || !img || !rect) return;

    const imgBounds = img.getBoundingRect();
    const scale = img.scaleX ?? 1;

    // Convert rect (canvas pixels) → source-image pixels.
    const cropX =
      ((rect.left ?? 0) - imgBounds.left) / scale + (img.cropX ?? 0);
    const cropY = ((rect.top ?? 0) - imgBounds.top) / scale + (img.cropY ?? 0);
    const cropW = rect.getScaledWidth() / scale;
    const cropH = rect.getScaledHeight() / scale;

    img.set({ cropX, cropY, width: cropW, height: cropH });
    img.setCoords();

    c.remove(rect);
    cropRectRef.current = null;
    setCropMode(false);

    pushHistory();
    fitRef.current();
  }, [fabricRef, userImageRef, fitRef, pushHistory]);

  return { cropMode, enterCrop, cancelCrop, applyCrop };
}
