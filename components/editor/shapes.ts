import * as fabric from "fabric";

// Scene coords are image-native pixels; the canvas element is CSS-downscaled
// to fit the viewport. Multiply on-screen sizes by this ratio so shapes and
// their handles land at a constant on-screen size on any image resolution.
export function cssScaleOf(canvas: fabric.Canvas) {
  const rect = canvas.upperCanvasEl?.getBoundingClientRect();
  return rect?.width ? canvas.getWidth() / rect.width : 1;
}

// Center a new object, nudged a few on-screen px so repeated adds don't stack
// into one blob. Wraps every 5 items to stay clustered near the middle.
// Counts only user-added objects (the locked background image is evented:false).
function centerNudge(canvas: fabric.Canvas, s: number) {
  const n = canvas.getObjects().filter((o) => o.evented !== false).length;
  const step = (n % 5) * 12 * s;
  return { left: canvas.getWidth() / 2 + step, top: canvas.getHeight() / 2 + step };
}

// Selection handles matching the text/crop chrome: white round grips +
// solid blue border, sized in on-screen px so they stay small & consistent
// regardless of how far the canvas is zoomed to fit.
export function handleStyle(s: number) {
  return {
    lockScalingFlip: true,
    cornerStyle: "circle" as const,
    cornerColor: "#ffffff",
    cornerStrokeColor: "rgba(0,0,0,0.25)",
    transparentCorners: false,
    cornerSize: 12 * s,
    touchCornerSize: 24 * s,
    borderColor: "#3b82f6",
    borderScaleFactor: 2 * s,
  };
}

// Add, select, and repaint — the trailing steps every add* shares.
function place(canvas: fabric.Canvas, obj: fabric.Object) {
  canvas.add(obj);
  canvas.setActiveObject(obj);
  canvas.requestRenderAll();
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
  const s = cssScaleOf(canvas);
  place(
    canvas,
    new fabric.IText("Edit me", {
      originX: "center",
      originY: "center",
      ...centerNudge(canvas, s),
      fontSize: Math.round(fontSize * s),
      fill: color,
      fontFamily,
      fontWeight: fontBold ? "bold" : "normal",
      fontStyle: fontItalic ? "italic" : "normal",
      underline: fontUnderline,
      ...handleStyle(s),
    }),
  );
}

export function addRect(canvas: fabric.Canvas, color: string) {
  const s = cssScaleOf(canvas);
  place(
    canvas,
    new fabric.Rect({
      originX: "center",
      originY: "center",
      ...centerNudge(canvas, s),
      width: 200 * s,
      height: 140 * s,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3 * s,
      strokeUniform: true,
      rx: 4 * s,
      ry: 4 * s,
      ...handleStyle(s),
    }),
  );
}

export function addCircle(canvas: fabric.Canvas, color: string) {
  const s = cssScaleOf(canvas);
  place(
    canvas,
    new fabric.Circle({
      originX: "center",
      originY: "center",
      ...centerNudge(canvas, s),
      radius: 80 * s,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3 * s,
      strokeUniform: true,
      ...handleStyle(s),
    }),
  );
}

export function addArrow(canvas: fabric.Canvas, color: string) {
  const s = cssScaleOf(canvas);
  const len = 200 * s;
  const line = new fabric.Line([0, 0, len, len * 0.5], {
    stroke: color,
    strokeWidth: 4 * s,
  });
  const head = new fabric.Triangle({
    left: len,
    top: len * 0.5,
    originX: "center",
    originY: "center",
    width: 20 * s,
    height: 24 * s,
    fill: color,
    angle: (Math.atan2(len * 0.5, len) * 180) / Math.PI + 90,
  });
  place(
    canvas,
    new fabric.Group([line, head], {
      originX: "center",
      originY: "center",
      ...centerNudge(canvas, s),
      ...handleStyle(s),
    }),
  );
}
