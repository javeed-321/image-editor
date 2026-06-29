import * as fabric from "fabric";

import { encodeCanvas } from "@/components/editor/fabric/canvas-actions";

export type BatchOptions = {
  padding: number;
  cornerRadius: number;
  bgColor?: string;
  format?: "png" | "jpg";
  /** URLs to pick from randomly. One is chosen per image. No background if empty. */
  backgroundUrls?: string[];
};

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function applyBackground(
  c: fabric.Canvas,
  url: string,
  canvasW: number,
  canvasH: number,
) {
  const bgImg = await fabric.FabricImage.fromURL(url, {
    crossOrigin: "anonymous",
  });

  // Cover-scale: uniform scale so the background fills the whole canvas
  const scale = Math.max(canvasW / bgImg.width, canvasH / bgImg.height);
  bgImg.set({
    scaleX: scale,
    scaleY: scale,
    left: canvasW / 2,
    top: canvasH / 2,
    originX: "center",
    originY: "center",
    selectable: false,
    evented: false,
  });

  c.backgroundImage = bgImg;
}

async function processOneImage(
  file: File,
  opts: BatchOptions,
): Promise<{ filename: string; blob: Blob }> {
  const dataUrl = await readFileAsDataUrl(file);

  const el = document.createElement("canvas");
  const c = new fabric.Canvas(el, { enableRetinaScaling: false });

  try {
    const img = await fabric.FabricImage.fromURL(dataUrl, {
      crossOrigin: "anonymous",
    });

    const {
      padding,
      cornerRadius,
      bgColor = "#ffffff",
      format = "png",
      backgroundUrls = [],
    } = opts;

    const canvasW = img.width + 2 * padding;
    const canvasH = img.height + 2 * padding;

    c.setWidth(canvasW);
    c.setHeight(canvasH);

    if (backgroundUrls.length > 0) {
      await applyBackground(c, pickRandom(backgroundUrls), canvasW, canvasH);
    } else {
      c.set({ backgroundColor: bgColor });
    }

    img.set({
      left: canvasW / 2,
      top: canvasH / 2,
      originX: "center",
      originY: "center",
      selectable: false,
      evented: false,
      objectCaching: false,
    });

    if (cornerRadius > 0) {
      img.set({
        clipPath: new fabric.Rect({
          width: img.width,
          height: img.height,
          rx: cornerRadius,
          ry: cornerRadius,
          originX: "center",
          originY: "center",
        }),
      });
    }

    c.add(img);
    c.renderAll();

    const { blob } = encodeCanvas(c, { format });
    const baseName = file.name.replace(/\.\w+$/, "");
    return { filename: `${baseName}.${format}`, blob };
  } finally {
    c.dispose();
  }
}

export async function batchProcess(
  files: File[],
  opts: BatchOptions,
  onProgress?: (done: number, total: number) => void,
): Promise<{ filename: string; blob: Blob }[]> {
  const results: { filename: string; blob: Blob }[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await processOneImage(files[i], opts);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
}
