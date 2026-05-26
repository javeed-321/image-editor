import * as fabric from "fabric";

export function rotateCanvas(
  c: fabric.Canvas,
  userImg: fabric.FabricImage,
  padding: number,
  fit: () => void,
) {
  const oldBounds = userImg.getBoundingRect();
  const oldW = oldBounds.width + 2 * padding;
  const oldH = oldBounds.height + 2 * padding;
  const oldCx = oldW / 2;
  const oldCy = oldH / 2;

  const newW = oldH;
  const newH = oldW;
  const newCx = newW / 2;
  const newCy = newH / 2;

  c.getObjects().forEach((obj) => {
    const dx = (obj.left ?? 0) - oldCx;
    const dy = (obj.top ?? 0) - oldCy;
    obj.set({
      left: newCx + -dy,
      top: newCy + dx,
      angle: ((obj.angle ?? 0) + 90) % 360,
    });
    obj.setCoords();
  });

  fit();
}

export function deleteSelectedObjects(
  c: fabric.Canvas,
  userImg: fabric.FabricImage | null,
) {
  c.getActiveObjects().forEach((o) => {
    if (o === userImg) return;
    c.remove(o);
  });
  c.discardActiveObject();
  c.requestRenderAll();
}

export function exportCanvas(
  c: fabric.Canvas,
  targetW?: number,
  fileName?: string,
) {
  const z = c.getZoom() || 1;
  const multiplier = targetW && targetW > 0 ? targetW / c.getWidth() : 1 / z;
  const data = c.toDataURL({ format: "png", multiplier });
  const a = document.createElement("a");
  a.href = data;
  a.download = fileName || "edited.png";
  a.click();
}
