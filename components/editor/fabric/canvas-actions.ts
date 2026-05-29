import * as fabric from "fabric";
import { toast } from "sonner";

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

  if(c.getActiveObjects().length === 0) return; 

  c.getActiveObjects().forEach((o) => {
    if (o === userImg) return;
    c.remove(o);
  });
  c.discardActiveObject();
  c.requestRenderAll();
}





function dataUrlToBlob(dataUrl: string): Blob {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function exportCanvas(
  c: fabric.Canvas,
  targetW?: number,
  fileName?: string,
) {
  const z = c.getZoom() || 1;
  const multiplier = targetW && targetW > 0 ? targetW / c.getWidth() : 1 / z;

  let dataUrl: string;
  try {
    dataUrl = c.toDataURL({ format: "png", multiplier });
  } catch {
    toast.error("Couldn't export image", {
      description: "The image source blocks exporting (CORS). Try uploading the file directly.",
    });
    return;
  }

  const base = (fileName || "edited").replace(/\.(png|jpe?g|gif|webp)$/i, "");
  const name = `${base}.png`;
  const blob = dataUrlToBlob(dataUrl);

  // Chromium (Chrome/Edge/Opera): native "Save As" dialog so the user picks
  // the folder. `startIn: "desktop"` opens the dialog on the Desktop.
  const w = window as unknown as {
    showSaveFilePicker?: (opts: {
      suggestedName?: string;
      startIn?: string;
      types?: { description: string; accept: Record<string, string[]> }[];
    }) => Promise<{
      createWritable: () => Promise<{
        write: (data: Blob) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (typeof w.showSaveFilePicker === "function") {
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName: name,
        startIn: "downloads",
        types: [{ description: "PNG image", accept: { "image/png": [".png"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err) {
      // User pressed Cancel in the dialog — stop silently.
      if (err instanceof DOMException && err.name === "AbortError") return;
      // Any other failure: fall through to the plain download below.
    }
  }

  // Fallback (Firefox/Safari, or non-secure context): regular download.
  // Whether a location prompt appears depends on the browser's settings.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
