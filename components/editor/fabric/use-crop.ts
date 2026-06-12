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
  // Scene-px distance within which applyCrop snaps a rect edge back onto
  // the image bounds (set to the enterCrop inset, see below).
  const snapRef = useRef(0);
  const [cropMode, setCropMode] = useState(false);

  const enterCrop = useCallback(() => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    if (!c || !img || cropMode) return;

    c.isDrawingMode = false;
    c.discardActiveObject();

    const b = img.getBoundingRect();

    // The backstore renders at native resolution and the element is
    // CSS-downscaled to fit the viewport (see use-canvas-fit), so anything
    // drawn in canvas px shrinks by that ratio on screen — an unscaled 2px
    // stroke and 13px handles become sub-pixel on large images. k converts
    // screen px to canvas px so the crop UI is a constant size on screen.
    const cssW = c.lowerCanvasEl.getBoundingClientRect().width;
    const k = cssW > 0 ? c.getWidth() / cssW : 1;

    // Start slightly inside the image so edge strokes/handles aren't
    // clipped by the canvas element; applyCrop snaps edges this close back
    // onto the image bounds, so applying without adjusting is still a no-op.
    const inset = Math.min(Math.ceil(8 * k), b.width / 8, b.height / 8);
    snapRef.current = inset + 1;

    const rect = new fabric.Rect({
      left: b.left + inset,
      top: b.top + inset,
      width: b.width - 2 * inset,
      height: b.height - 2 * inset,
      originX: "left",
      originY: "top",
      excludeFromExport: true, // keep the crop rect out of history & saved JSON
      centeredScaling: false,
      centeredRotation: false,
      lockScalingFlip: true,
      fill: "rgba(59,130,246,0.06)",
      stroke: "#3b82f6",
      strokeWidth: 2 * k,
      strokeUniform: true,
      cornerSize: 12 * k,
      touchCornerSize: 24 * k,
      // The solid stroke is the crop border; fabric's own selection border
      // would draw a second line on top of it.
      hasBorders: false,
      lockRotation: true,
    });

    // Canva-style handles: white circles on the corners, white pills on the
    // edge midpoints, all with a soft shadow, drawn at constant screen size.
    // Fresh controls instance so the default controls shared by every other
    // object stay untouched.
    const handleShadow = "rgba(0,0,0,0.3)";
    const handleStroke = "rgba(0,0,0,0.15)";
    const drawCircle: fabric.Control["render"] = (ctx, left, top) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(left, top, 7 * k, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = handleShadow;
      ctx.shadowBlur = 3 * k;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 1 * k;
      ctx.strokeStyle = handleStroke;
      ctx.stroke();
      ctx.restore();
    };
    const drawPill = (vertical: boolean): fabric.Control["render"] =>
      (ctx, left, top) => {
        const w = (vertical ? 6 : 20) * k;
        const h = (vertical ? 20 : 6) * k;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(left - w / 2, top - h / 2, w, h, Math.min(w, h) / 2);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = handleShadow;
        ctx.shadowBlur = 3 * k;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.lineWidth = 1 * k;
        ctx.strokeStyle = handleStroke;
        ctx.stroke();
        ctx.restore();
      };

    rect.controls = fabric.controlsUtils.createObjectDefaultControls();
    rect.controls.tl.render = drawCircle;
    rect.controls.tr.render = drawCircle;
    rect.controls.bl.render = drawCircle;
    rect.controls.br.render = drawCircle;
    rect.controls.ml.render = drawPill(true);
    rect.controls.mr.render = drawPill(true);
    rect.controls.mt.render = drawPill(false);
    rect.controls.mb.render = drawPill(false);
    rect.setControlsVisibility({ mtr: false });

    // Keep the crop selection inside the user image: clamp on every drag /
    // resize tick so no edge can ever pass the image bounds. While resizing,
    // only the edge being dragged gets pinned — the opposite edge stays put.
    // NOTE: sizes are measured stroke-free (width × scaleX), NOT via
    // getScaledWidth() — that includes strokeWidth, so re-deriving the
    // scale from it inflates the box a little on BOTH axes every tick,
    // making the sides the user isn't dragging creep outward.
    const clampMove = () => {
      const sw = (rect.width ?? 0) * (rect.scaleX ?? 1);
      const sh = (rect.height ?? 0) * (rect.scaleY ?? 1);
      rect.set({
        left: Math.min(
          Math.max(rect.left ?? 0, b.left),
          b.left + b.width - sw,
        ),
        top: Math.min(
          Math.max(rect.top ?? 0, b.top),
          b.top + b.height - sh,
        ),
      });
      rect.setCoords();
    };
    const clampScale = () => {
      const left = Math.max(rect.left ?? 0, b.left);
      const top = Math.max(rect.top ?? 0, b.top);
      const right = Math.min(
        (rect.left ?? 0) + (rect.width ?? 0) * (rect.scaleX ?? 1),
        b.left + b.width,
      );
      const bottom = Math.min(
        (rect.top ?? 0) + (rect.height ?? 0) * (rect.scaleY ?? 1),
        b.top + b.height,
      );
      rect.set({
        left,
        top,
        scaleX: Math.max((right - left) / (rect.width || 1), 0.01),
        scaleY: Math.max((bottom - top) / (rect.height || 1), 0.01),
      });
      rect.setCoords();
    };
    rect.on("moving", clampMove);
    rect.on("scaling", clampScale);

    c.add(rect);
    c.setActiveObject(rect);
    c.requestRenderAll();
    cropRectRef.current = rect;
    setCropMode(true);
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
    let left = rect.left ?? 0;
    let top = rect.top ?? 0;
    let right = left + rect.getScaledWidth();
    let bottom = top + rect.getScaledHeight();

    // Snap edges released near the image bounds back onto them — this also
    // undoes the visibility inset from enterCrop, so opening crop and
    // applying without adjusting leaves the image untouched.
    const b = img.getBoundingRect();
    const snap = snapRef.current;
    if (Math.abs(left - b.left) <= snap) left = b.left;
    if (Math.abs(top - b.top) <= snap) top = b.top;
    if (Math.abs(right - (b.left + b.width)) <= snap) right = b.left + b.width;
    if (Math.abs(bottom - (b.top + b.height)) <= snap) bottom = b.top + b.height;

    const corners = [
      new fabric.Point(left, top),
      new fabric.Point(right, top),
      new fabric.Point(right, bottom),
      new fabric.Point(left, bottom),
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