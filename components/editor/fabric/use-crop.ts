import { useCallback, useRef, useState, type RefObject } from "react";
import * as fabric from "fabric";

type Params = {
  fabricRef: RefObject<fabric.Canvas | null>;
  userImageRef: RefObject<fabric.FabricImage | null>;
  fitRef: RefObject<() => void>;
  pushHistory: () => void;
  relock: () => void;
};

export function useCrop({
  fabricRef,
  userImageRef,
  fitRef,
  pushHistory,
  relock,
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
      excludeFromExport: true, // keep the crop rect out of history & saved JSON
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

    const cropX0 = img.cropX ?? 0;
    const cropY0 = img.cropY ?? 0;
    const W = img.width ?? 0;
    const H = img.height ?? 0;

    // scene coords -> image-local coords (source pixels, centered at the image center)
    const inv = fabric.util.invertTransform(img.calcTransformMatrix());

    // crop rect corners in scene space (rect is axis-aligned, origin top-left)
    const left = rect.left ?? 0;
    const top = rect.top ?? 0;
    const sw = rect.getScaledWidth();
    const sh = rect.getScaledHeight();
    const corners = [
      new fabric.Point(left, top),
      new fabric.Point(left + sw, top),
      new fabric.Point(left + sw, top + sh),
      new fabric.Point(left, top + sh),
    ];

    // map each corner into source-pixel space
    const pts = corners.map((p) => {
      const local = fabric.util.transformPoint(p, inv); // centered, source px
      return { x: cropX0 + local.x + W / 2, y: cropY0 + local.y + H / 2 };
    });

    const minX = Math.min(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    const maxX = Math.max(...pts.map((p) => p.x));
    const maxY = Math.max(...pts.map((p) => p.y));

    // clamp to the currently visible source region
    const newCropX = Math.min(Math.max(minX, cropX0), cropX0 + W);
    const newCropY = Math.min(Math.max(minY, cropY0), cropY0 + H);
    const newW = Math.min(maxX, cropX0 + W) - newCropX;
    const newH = Math.min(maxY, cropY0 + H) - newCropY;

    // Reset scale to 1 so the upcoming relock captures the new cropped
    // dims as the natural canvas size — without this, the cached padded
    // scale leaks into fixedCanvasRef and the canvas comes out too small.
    img.set({
      cropX: newCropX,
      cropY: newCropY,
      width: newW,
      height: newH,
      scaleX: 1,
      scaleY: 1,
    });
    img.setCoords();

    c.remove(rect);
    cropRectRef.current = null;
    setCropMode(false);

    // Force fit() to re-lock canvas dims to the new cropped image size.
    relock();
    fitRef.current();
    pushHistory();

  }, [fabricRef, userImageRef, fitRef, pushHistory, relock]);


  return { cropMode, enterCrop, cancelCrop, applyCrop };
}