  import * as fabric from "fabric";

// Scene coords are image-native pixels; the canvas element is CSS-downscaled
// to fit the viewport. Multiply on-screen sizes by this ratio so shapes and
// their handles land at a constant on-screen size on any image resolution.
export function cssScaleOf(canvas: fabric.Canvas) {
  const rect = canvas.upperCanvasEl?.getBoundingClientRect();
  return rect?.width ? canvas.getWidth() / rect.width : 1;
}

// Selection handles matching the text/crop chrome: white round grips +
// solid blue border, sized in on-screen px so they stay small & consistent
// regardless of how far the canvas is zoomed to fit.
export function handleStyle(cssScale: number) {
  return {
    lockScalingFlip: true,
    cornerStyle: "circle" as const,
    cornerColor: "#ffffff",
    cornerStrokeColor: "rgba(0,0,0,0.25)",
    transparentCorners: false,
    cornerSize: 12 * cssScale,
    touchCornerSize: 24 * cssScale,
    borderColor: "#3b82f6",
    borderScaleFactor: 2 * cssScale,
  };
}

export function addText(
  canvas: fabric.Canvas,
  color: string,
  fontSize: number,
  fontFamily = "Arial",
  fontBold = false,
  fontItalic = false,
  fontUnderline = false,
) {
  // Clicking Text with a text already selected shouldn't stack a second
  // copy on top of it — put the cursor in the selected one instead.
  const active = canvas.getActiveObject();
  if (active instanceof fabric.IText) {
    active.enterEditing();
    active.selectAll();
    canvas.requestRenderAll();
    return;
  }

  // Scene coords are image-native pixels; the element is CSS-downscaled to
  // fit the viewport. Multiply by the css/backstore ratio so the text lands
  // at the canvas center at the slider's on-screen size.
  const rect = canvas.upperCanvasEl?.getBoundingClientRect();
  const cssScale = rect?.width ? canvas.getWidth() / rect.width : 1;

  // Cascade consecutive texts (~24 screen px per step) so a new one never
  // lands exactly on an earlier one and looks like a duplicate.
  const existing = canvas
    .getObjects()
    .filter((o) => o instanceof fabric.IText).length;
  const step = (existing % 8) * 24 * cssScale;

  const t = new fabric.IText("Edit me", {
    originX: "center",
    originY: "center",
    left: canvas.getWidth() / 2 + step,
    top: canvas.getHeight() / 2 + step,
    fontSize: Math.round(fontSize * cssScale),
    fill: color,
    fontFamily,
    fontWeight: fontBold ? "bold" : "normal",
    fontStyle: fontItalic ? "italic" : "normal",
    underline: fontUnderline,
    lockScalingFlip: true,   // corner-drag past the opposite edge can no longer mirror it
    // Match the crop handles: white round grips + solid blue border,
    // scaled by cssScale so they keep a constant on-screen size.
    cornerStyle: "circle",
    cornerColor: "#ffffff",
    cornerStrokeColor: "rgba(0,0,0,0.25)",
    transparentCorners: false,
    cornerSize: 12 * cssScale,
    touchCornerSize: 24 * cssScale,
    borderColor: "#3b82f6",
    borderScaleFactor: 2 * cssScale,
  });
  canvas.add(t);
  canvas.setActiveObject(t);
  canvas.requestRenderAll();
}

  export function addRect(canvas: fabric.Canvas, color: string) {
    const s = cssScaleOf(canvas);
    const r = new fabric.Rect({
      originX: "center",
      originY: "center",
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      width: 200 * s,
      height: 140 * s,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3 * s,
      strokeUniform: true,
      rx: 4 * s,
      ry: 4 * s,
      ...handleStyle(s),
    });
    canvas.add(r);
    canvas.setActiveObject(r);
    canvas.requestRenderAll();
  }

  export function addCircle(canvas: fabric.Canvas, color: string) {
    const s = cssScaleOf(canvas);
    const ci = new fabric.Circle({
      originX: "center",
      originY: "center",
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      radius: 80 * s,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3 * s,
      strokeUniform: true,
      ...handleStyle(s),
    });
    canvas.add(ci);
    canvas.setActiveObject(ci);
    canvas.requestRenderAll();
  }

  export function addArrow(canvas: fabric.Canvas, color: string) {
    const s = cssScaleOf(canvas);
    const len = 200 * s;
    const x1 = 0;
    const y1 = 0;
    const x2 = len;
    const y2 = len * 0.5;
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: color,
      strokeWidth: 4 * s,
    });
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = new fabric.Triangle({
      left: x2,
      top: y2,
      originX: "center",
      originY: "center",
      width: 20 * s,
      height: 24 * s,
      fill: color,
      angle: (angle * 180) / Math.PI + 90,
    });
    const g = new fabric.Group([line, head], {
      originX: "center",
      originY: "center",
      left: canvas.getWidth() / 2,
      top: canvas.getHeight() / 2,
      ...handleStyle(s),
    });
    canvas.add(g);
    canvas.setActiveObject(g);
    canvas.requestRenderAll();
  }
