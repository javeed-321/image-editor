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

    const z = c.getZoom() || 1;
    const canvasW = c.getWidth()  / z;
    const canvasH = c.getHeight() / z;

    // Start the rect covering the WHOLE canvas (image + surrounding bg area).
    // User can shrink inward as needed; the bg area outside the image is
    // selectable from the moment crop mode opens.
    const rect = new fabric.Rect({
      left:   0,
      top:    0,
      width:  canvasW,
      height: canvasH,
      originX: "left",
      originY: "top",
      excludeFromExport: true,
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

    // Clamp to CANVAS bounds (Option B — crop the whole composition).
    const clamp = () => {
      const w = rect.getScaledWidth();
      const h = rect.getScaledHeight();
      rect.left = Math.max(0, Math.min(canvasW - w, rect.left ?? 0));
      rect.top  = Math.max(0, Math.min(canvasH - h, rect.top  ?? 0));
      const maxW = canvasW - (rect.left ?? 0);
      const maxH = canvasH - (rect.top  ?? 0);
      if (w > maxW && rect.width)  rect.scaleX = maxW / rect.width;
      if (h > maxH && rect.height) rect.scaleY = maxH / rect.height;
      rect.setCoords();
    };
    rect.on("moving",  clamp);
    rect.on("scaling", clamp);
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

  const applyCrop = useCallback(async () => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    const rect = cropRectRef.current;
    if (!c || !img || !rect) return;

    const z = c.getZoom() || 1;
    const left = rect.left ?? 0;
    const top  = rect.top  ?? 0;
    const w    = rect.getScaledWidth();
    const h    = rect.getScaledHeight();

    // Temporarily hide the crop overlay AND lift the background image
    // + background color off the canvas, so the rendered crop contains
    // ONLY user image + annotations as opaque pixels. Areas with no
    // object stay TRANSPARENT, letting the re-attached bg show through
    // after crop. (fit() restores backgroundColor from the bgColor prop.)
    rect.visible = false;
    const savedBg = c.backgroundImage;
    const savedBgColor = c.backgroundColor;
    c.backgroundImage = undefined;
    c.backgroundColor = "";
    c.requestRenderAll();

    let dataUrl: string;
    try {
      dataUrl = c.toDataURL({
        format: "png",
        multiplier: 1 / z,
        left:   left * z,
        top:    top  * z,
        width:  w    * z,
        height: h    * z,
      });
    } catch {
      // Tainted canvas (CORS) — restore state and bail.
      rect.visible = true;
      c.backgroundImage = savedBg;
      c.backgroundColor = savedBgColor;
      c.requestRenderAll();
      return;
    }

    const newImg = await fabric.FabricImage.fromURL(dataUrl);
    if (!fabricRef.current) return; // unmounted mid-async

    // Wipe old objects (image + annotations are now baked into newImg).
    // Snapshot the array first — c.remove() mutates getObjects() and
    // forEach would otherwise skip every other element.
    [...c.getObjects()].forEach((o) => c.remove(o));
    c.discardActiveObject();

    // Re-attach the background as a separate layer.
    c.backgroundImage = savedBg;

    newImg.set({
      selectable: false,
      evented: false,
      originX: "center",
      originY: "center",
    });
    (newImg as any).isUserImage = true;
    c.add(newImg);
    c.sendObjectToBack(newImg);

    userImageRef.current = newImg;
    c.setDimensions({ width: newImg.width, height: newImg.height });

    cropRectRef.current = null;
    setCropMode(false);

    // fit() detects the new userImg instance, re-locks canvas dims,
    // and re-scales the (preserved) bg to cover the new canvas.
    fitRef.current();
    pushHistory();
  }, [fabricRef, userImageRef, fitRef, pushHistory]);


  return { cropMode, enterCrop, cancelCrop, applyCrop };
}
