import * as fabric from "fabric";
import { toast } from "sonner";

export function rotateCanvas(
  c: fabric.Canvas,
  _userImg: fabric.FabricImage,
  fit: () => void,
) {
  // Canvas internal dims = display dims / zoom. Independent of padding now.
  const z = c.getZoom() || 1;
  const oldW = c.getWidth() / z;
  const oldH = c.getHeight() / z;
  const oldCx = oldW / 2;
  const oldCy = oldH / 2;

  const newCx = oldH / 2;
  const newCy = oldW / 2;

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

  // Background image isn't in c.getObjects() — rotate it explicitly so it
  // spins together with the user image and shapes.
  const bg = c.backgroundImage;
  if (bg && typeof bg !== "string") {
    const dx = (bg.left ?? 0) - oldCx;
    const dy = (bg.top ?? 0) - oldCy;
    bg.set({
      left: newCx + -dy,
      top: newCy + dx,
      angle: ((bg.angle ?? 0) + 90) % 360,
    });
    bg.setCoords();
  }

  fit();
}

export function deleteSelectedObjects(
  c: fabric.Canvas,
  userImg: fabric.FabricImage | null,
) {

  if(c.getActiveObjects().length === 0) return; 

  c.getActiveObjects().forEach((o) => {
    if (o === userImg) return;
    c.remove(o);
  });
  c.discardActiveObject();
  c.requestRenderAll();
}







export function exportCanvas(c: fabric.Canvas, fileName?: string) {
  // 1/zoom undoes the on-screen zoom so we render at the canvas's natural
  // pixel size. multiplier = 1 here means "1:1" — no upscaling = no pixelation.
  const multiplier = 1 / (c.getZoom() || 1);

  let dataUrl: string;
  try {
    dataUrl = c.toDataURL({ format: "png", multiplier });
  } catch {
    toast.error("Couldn't export image", {
      description: "The image source blocks exporting (CORS). Try uploading the file directly.",
    });
    return;
  }

  const name = `${(fileName || "edited").replace(/\.\w+$/, "")}.png`;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}
