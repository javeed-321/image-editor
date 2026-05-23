  import * as fabric from "fabric";

  export function addText(canvas: fabric.Canvas, color: string) {
    const t = new fabric.IText("Edit me", {
      left: 60,
      top: 60,
      fontSize: 22,
      fill: color,
    });
    canvas.add(t);
    canvas.setActiveObject(t);
    canvas.requestRenderAll();
  }

  export function addRect(canvas: fabric.Canvas, color: string) {
    const r = new fabric.Rect({
      left: 80,
      top: 80,
      width: 160,
      height: 110,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3,
      rx: 4,
      ry: 4,
    });
    canvas.add(r);
    canvas.setActiveObject(r);
    canvas.requestRenderAll();
  }

  export function addCircle(canvas: fabric.Canvas, color: string) {
    const ci = new fabric.Circle({
      left: 100,
      top: 100,
      radius: 60,
      fill: "transparent",
      stroke: color,
      strokeWidth: 3,
    });
    canvas.add(ci);
    canvas.setActiveObject(ci);
    canvas.requestRenderAll();
  }

  export function addArrow(canvas: fabric.Canvas, color: string) {
    const x1 = 80;
    const y1 = 80;
    const x2 = 240;
    const y2 = 160;
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: color,
      strokeWidth: 4,
    });
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = new fabric.Triangle({
      left: x2,
      top: y2,
      originX: "center",
      originY: "center",
      width: 16,
      height: 20,
      fill: color,
      angle: (angle * 180) / Math.PI + 90,
    });
    const g = new fabric.Group([line, head]);
    canvas.add(g);
    canvas.setActiveObject(g);
    canvas.requestRenderAll();
  }
