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







export type ExportFormat = "png" | "jpg" | "jpeg";

export type ExportOptions = {
  filename?: string;
  format?: ExportFormat;
  /** Output width in pixels. Defaults to canvas native (no upscale, no pixelation). */
  targetWidth?: number;
  /** JPEG only. true ≈ 0.6 quality, false ≈ 0.92 quality. Ignored for PNG. */
  compress?: boolean;
  /** PNG only. Strip canvas backgroundColor so the output has alpha. Ignored for JPEG. */
  transparent?: boolean;
};

// One source of truth for the toDataURL params so the size shown in the
// download menu (measureExportBytes) is byte-identical to the saved file.
// c.getWidth() is the backstore (internal pixel) width — CSS-only shrinking
// doesn't change it — and toDataURL output width = c.getWidth() × multiplier,
// so dividing yields exactly the requested pixel width.
function exportParams(c: fabric.Canvas, opts: ExportOptions) {
  const { format = "png", targetWidth, compress = false } = opts;
  const zoom = c.getZoom() || 1;
  const multiplier = targetWidth ? targetWidth / c.getWidth() : 1 / zoom;
  const isJpeg = format === "jpg" || format === "jpeg";
  return {
    isJpeg,
    fabricFormat: isJpeg ? ("jpeg" as const) : ("png" as const),
    multiplier,
    quality: isJpeg ? (compress ? 0.6 : 0.92) : 1,
  };
}

// Exact byte size the current settings would download: encode the real
// export and count its base64 payload. Heavier than a heuristic (full-res
// encode, ~100ms+) — callers should debounce. Null when the canvas is
// tainted by a CORS image; the download itself would fail the same way.
export function measureExportBytes(
  c: fabric.Canvas,
  opts: ExportOptions = {},
): number | null {
  const { fabricFormat, multiplier, quality } = exportParams(c, opts);
  let dataUrl: string;
  try {
    dataUrl = c.toDataURL({ format: fabricFormat, multiplier, quality });
  } catch {
    return null;
  }
  const payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.floor((payload.length * 3) / 4) - padding;
}

export function exportCanvas(c: fabric.Canvas, opts: ExportOptions = {}) {
  const { filename, transparent = false, format = "png" } = opts;
  const { isJpeg, fabricFormat, multiplier, quality } = exportParams(c, opts);

  // PNG transparency: temporarily drop the canvas backgroundColor so the
  // exported file carries alpha. Restore after toDataURL so the on-screen
  // canvas is unchanged. JPEG can't store alpha — skip.
  const savedBg = c.backgroundColor;
  const wantTransparent = transparent && !isJpeg;
 

  let dataUrl: string;
  try {
    dataUrl = c.toDataURL({ format: fabricFormat, multiplier, quality });
  } catch {
    toast.error("Couldn't export image", {
      description: "The image source blocks exporting (CORS). Try uploading the file directly.",
    });
    return;
  } finally {
    if (wantTransparent) {
      c.backgroundColor = savedBg;
      c.requestRenderAll();
    }
  }

  const ext = isJpeg ? (format === "jpeg" ? "jpeg" : "jpg") : "png";
  const name = `${(filename || "edited").replace(/\.\w+$/, "")}.${ext}`;
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = name;
  a.click();
}
