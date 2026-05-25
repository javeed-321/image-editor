"use client";
import { Spinner } from "@/components/ui/spinner";

import { useCallback, useEffect, useRef,useLayoutEffect, useState } from "react";
import * as fabric from "fabric";
import { Check, X } from "lucide-react";

import { BackgroundDialog } from "./background-dialog";
import { EditorToolbar, type Tool } from "./editor-toolbar";
import { SaveMenu } from "./save-menu";
import { addArrow, addCircle, addRect, addText } from "./shapes";
import { UploadScreen } from "./upload-screen";
import { withAlpha } from "@/lib/utils";

const MAX_W = 1100;
const MAX_H = 2000;

export default function FabricCanvas() {


  const STORAGE = {
    USER_IMAGE: "editor.userImage",
    BG_IMAGE: "editor.bgImage",
    FILENAME: "editor.filename",
  };

  const safeSet = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`localStorage failed for ${key}:`, e);
    }
  };

  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const restoringRef = useRef<boolean>(false);
  const userImageRef = useRef<fabric.FabricImage | null>(null);
  const fitRef = useRef<() => void>(() => { });
  const cropRectRef = useRef<fabric.Rect | null>(null);
  const [cropMode, setCropMode] = useState(false);



  const [imageSrc, setImageSrc] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE.USER_IMAGE)
      : null,
  );
  const [filename, setFilename] = useState<string>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE.FILENAME) ?? ""
      : "",
  );
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(STORAGE.BG_IMAGE)
      : null,
  );

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>("#ef4444");
  const [zoom, setZoom] = useState<number>(1);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [padding, setPadding] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgDialogOpen, setBgDialogOpen] = useState<boolean>(false);
const [loading, setLoading] = useState(false);








  const pushHistory = useCallback(() => {
    const c = fabricRef.current;
    if (!c || restoringRef.current) return;
    const json = JSON.stringify(c.toJSON());
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(json);
    historyIdxRef.current = historyRef.current.length - 1;
  }, []);

  useEffect(() => {
    if (!imageSrc || !canvasElRef.current) return;
    let cancelled = false;

    const c = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
    });
    fabricRef.current = c;

    fabric.FabricImage.fromURL(imageSrc, { crossOrigin: "anonymous" })
      .then((img) => {
        if (cancelled) return;
        const w = img.width ?? MAX_W;
        const h = img.height ?? MAX_H;
        const scale = Math.min(MAX_W / w, MAX_H / h, 1);
        userImageRef.current = img;
        img.scale(scale);
        img.set({
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
        c.add(img);
        c.sendObjectToBack(img);
        c.setDimensions({ width: w * scale, height: h * scale });
        c.requestRenderAll();
    setLoading(false);   // ← add this

        setHasImage(true);
      })
      .catch(() => {    setLoading(false);   // ← add this so failed URL loads don't leave spinner spinning
 });

    c.on("path:created", pushHistory);
    c.on("object:modified", pushHistory);

    return () => {
      cancelled = true;
      c.dispose();
      fabricRef.current = null;
    };
  }, [imageSrc, pushHistory]);

  useEffect(() => {
    const c = fabricRef.current;
    if (!c) return;
    if (tool === "pen") {
      c.isDrawingMode = true;
      const brush = new fabric.PencilBrush(c);
      brush.color = color;
      brush.width = 4;
      c.freeDrawingBrush = brush;
    } else if (tool === "highlight") {
      c.isDrawingMode = true;
      const brush = new fabric.PencilBrush(c);
      brush.color = "rgba(253, 224, 71, 0.4)";   // #fde047 @ 40% opacity

      brush.width = 20;
      // ← thicker
      c.freeDrawingBrush = brush;
    }
    else if (tool === "blur") {
      c.isDrawingMode = true;
      const brush = new fabric.PencilBrush(c);
      brush.color = "white";   // dark slate — fully opaque so content is unreadable
      brush.width = 19;          // wider than highlight; covers a line of text in one stroke
      brush.strokeLineCap = "round";
      c.freeDrawingBrush = brush;

    }
    else {
      c.isDrawingMode = false;
    }
  }, [tool, color]);

  useLayoutEffect(() => {
    if (!hasImage) return;
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    const wrap = canvasWrapRef.current;
    if (!c || !userImg || !wrap) return;

    const fit = () => {
      // Read the AABB after rotation — width/height auto-swap for 90/270°
      const bounds = userImg.getBoundingRect();
      const framedW = bounds.width + 2 * padding;
      const framedH = bounds.height + 2 * padding;

      // Center the image inside the framed canvas
      userImg.set({ left: framedW / 2, top: framedH / 2 });
      userImg.setCoords();

      c.backgroundColor = bgColor;

      const bg = c.backgroundImage;
      if (bg && typeof bg !== "string") {
        bg.set({
          scaleX: framedW / (bg.width ?? 1),
          scaleY: framedH / (bg.height ?? 1),
        });
      }

      // Container's actual measured size → fit zoom, then layer user zoom on top
      const availW = wrap.clientWidth - 24;
      const availH = wrap.clientHeight - 24;
      const fitZoom = Math.min(availW / framedW, availH / framedH, 1);
      const z = Math.max(0.1, fitZoom * zoom);

      c.setZoom(z);
      c.setDimensions({ width: framedW * z, height: framedH * z });
      c.requestRenderAll();

      if (historyRef.current.length === 0) {
        historyRef.current = [JSON.stringify(c.toJSON())];
        historyIdxRef.current = 0;
      }
    };

    fitRef.current = fit;
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [hasImage, padding, bgColor, zoom]);


  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !hasImage) return;

    if (!bgImageUrl) {
      c.backgroundImage = undefined;
      c.requestRenderAll();
      return;
    }

    let cancelled = false;
    fabric.FabricImage.fromURL(bgImageUrl, { crossOrigin: "anonymous" })
      .then((bgImg) => {
        if (cancelled) return;
        c.backgroundImage = bgImg;
        fitRef.current();
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage]);


  const uploadFromFile = (file: File) => {
      setLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      setFilename(file.name);
      safeSet(STORAGE.USER_IMAGE, dataUrl);   // ← new
      safeSet(STORAGE.FILENAME, file.name);   // ← new
    };
  reader.onerror = () => setLoading(false);   // ← so the spinner can't get stuck

    reader.readAsDataURL(file);
  };


  const uploadFromURL = (url: string) => {
setLoading(true);
  setImageSrc(url);
  setFilename(url.split("/").pop() || "image");

  }




if (!imageSrc) {
  return (
    <UploadScreen
      onLoadFromFile={uploadFromFile}
      onLoadFromUrl={uploadFromURL}
    />
  );
}

  if (!imageSrc) {
    return (
      <UploadScreen
        onLoadFromFile={uploadFromFile}
        onLoadFromUrl={uploadFromURL}
      />
    );
  }

  const handleTool = (id: Tool) => {
    setTool(id);
    const c = fabricRef.current;
    if (!c) return;
    if (id === "text") addText(c, color);
    else if (id === "rect") addRect(c, color);
    else if (id === "circle") addCircle(c, color);
    else if (id === "arrow") addArrow(c, color);
    if (id !== "pen" && id !== "select") pushHistory();
  };


  const restore = async (delta: number) => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    const nextIndex = historyIdxRef.current + delta;
    const history = historyRef.current;

    if (nextIndex < 0 || nextIndex >= history.length) return;

    try {
      restoringRef.current = true;
      historyIdxRef.current = nextIndex;
      await canvas.loadFromJSON(history[nextIndex]);
      canvas.requestRenderAll();
    } catch (err) {
      console.error("Failed to restore canvas state:", err);
    } finally {
      restoringRef.current = false;
    }
  };

  const rotate = () => {
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    if (!c || !userImg) return;

    // Old framed dims and center (before this rotation)
    const oldBounds = userImg.getBoundingRect();
    const oldW = oldBounds.width + 2 * padding;
    const oldH = oldBounds.height + 2 * padding;
    const oldCx = oldW / 2;
    const oldCy = oldH / 2;

    // After 90° CW, framed dims swap → new center too
    const newW = oldH;
    const newH = oldW;
    const newCx = newW / 2;
    const newCy = newH / 2;

    // Rotate EVERY object (image included) 90° CW around the old center,
    // then re-anchor to the new center.
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

    // Sizing + bg rescale + fit-to-viewport now go through the single fit() path.
    fitRef.current();
  };



  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    const userImg = userImageRef.current;
    c.getActiveObjects().forEach((o) => {
      if (o === userImg) return;
      c.remove(o);
    });
    c.discardActiveObject();
    c.requestRenderAll();
    pushHistory();
  };

  const cancel = () => {
    setImageSrc(null);
    setFilename("");
    setTool("select");
    setZoom(1);
    setHasImage(false);
    setPadding(0);
    setBgColor("#ffffff");
    setBgImageUrl(null);

    historyRef.current = [];
    historyIdxRef.current = -1;
    userImageRef.current = null;
    localStorage.removeItem(STORAGE.BG_IMAGE);
    localStorage.removeItem(STORAGE.FILENAME)
    localStorage.removeItem(STORAGE.USER_IMAGE)

  };



  const enterCrop = () => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    if (!c || !img || cropMode) return;

    c.isDrawingMode = false;
    c.discardActiveObject();

    const b = img.getBoundingRect();
    const rect = new fabric.Rect({
      left: b.left + 10, top: b.top + 10, width: b.width - 50, height: b.height - 50,
      fill: "rgba(59,130,246,0.08)",
      stroke: "#3b82f6", strokeDashArray: [6, 4], strokeWidth: 2, strokeUniform: true,
      cornerColor: "#3b82f6", cornerStyle: "circle", transparentCorners: false,
      lockRotation: true, hasRotatingPoint: false,
      minScaleLimit: 0.05,
    });

    // ── Clamp to image bounds on every move/scale ────────────────
    const clamp = () => {
      const ib = img.getBoundingRect();
      const minL = ib.left;
      const minT = ib.top;
      const maxR = ib.left + ib.width;
      const maxB = ib.top + ib.height;

      // Compute the rect's four edges as the user just left them
      let l = rect.left ?? 0;
      let t = rect.top ?? 0;
      let r = l + rect.getScaledWidth();
      let b = t + rect.getScaledHeight();

      // Clamp each edge to the image
      if (l < minL) l = minL;
      if (t < minT) t = minT;
      if (r > maxR) r = maxR;
      if (b > maxB) b = maxB;

      // Reapply as position + scale (single source of truth)
      rect.set({
        left: l,
        top: t,
        scaleX: (r - l) / (rect.width ?? 1),
        scaleY: (b - t) / (rect.height ?? 1),
      });
      rect.setCoords();
    };


    rect.on("moving", clamp);
    rect.on("scaling", clamp);
    // ─────────────────────────────────────────────────────────────

    c.add(rect);

    c.setActiveObject(rect);
    cropRectRef.current = rect;
    setCropMode(true);
  };

  const cancelCrop = () => {
    const c = fabricRef.current;
    const rect = cropRectRef.current;
    if (!c || !rect) return;
    c.remove(rect);
    c.requestRenderAll();
    cropRectRef.current = null;
    setCropMode(false);
  };

  const applyCrop = () => {
    const c = fabricRef.current;
    const img = userImageRef.current;
    const rect = cropRectRef.current;
    if (!c || !img || !rect) return;

    const imgBounds = img.getBoundingRect();
    const scale = img.scaleX ?? 1;

    // Clamp the crop rect to the image's visible area first
    const rL = Math.max(rect.left ?? 0, imgBounds.left);
    const rT = Math.max(rect.top ?? 0, imgBounds.top);
    const rR = Math.min((rect.left ?? 0) + rect.getScaledWidth(), imgBounds.left + imgBounds.width);
    const rB = Math.min((rect.top ?? 0) + rect.getScaledHeight(), imgBounds.top + imgBounds.height);
    const rW = rR - rL;
    const rH = rB - rT;
    if (rW <= 1 || rH <= 1) { cancelCrop(); return; }

    // Convert canvas-space → source-image-pixel space.
    // Add existing cropX/Y so successive crops compound correctly.
    const cropX = (rL - imgBounds.left) / scale + (img.cropX ?? 0);
    const cropY = (rT - imgBounds.top) / scale + (img.cropY ?? 0);
    const cropW = rW / scale;
    const cropH = rH / scale;

    img.set({ cropX, cropY, width: cropW, height: cropH });
    img.setCoords();

    c.remove(rect);
    cropRectRef.current = null;
    setCropMode(false);

    pushHistory();
    fitRef.current();  // re-fit canvas to new image size
  };



  const save = (targetW?: number,nameOfFile?:string) => {
    const c = fabricRef.current;
    if (!c) return;
    const z = c.getZoom() || 1;
    // multiplier: 1/z gives the natural (un-zoomed) canvas size.
    // For preset widths, scale relative to current canvas width.
    const multiplier =
      targetW && targetW > 0 ? targetW / c.getWidth() : 1 / z;
    const data = c.toDataURL({ format: "png", multiplier });
    const a = document.createElement("a");
    a.href = data;
    
    a.download = nameOfFile || "edited.png";
    a.click();
  };

  const handleBgImgChange = (url: string | null) => {
    setBgImageUrl(url);
    if (url) safeSet(STORAGE.BG_IMAGE, url);
    else localStorage.removeItem(STORAGE.BG_IMAGE);
  };

  return (
    <div className="flex flex-1 flex-col">
      <EditorToolbar
        filename={filename}
        tool={tool}
        color={color}
        onTool={handleTool}
        onUndo={() => restore(-1)}
        onRedo={() => restore(1)}
        onColorChange={setColor}
        onDelete={deleteSelected}
        onCancel={cancel}
        onSave={save}
        onOpenBackground={() => setBgDialogOpen(true)}
        onRotate={rotate}
        onCrop={enterCrop}

      />
      <BackgroundDialog
        open={bgDialogOpen}
        onOpenChange={setBgDialogOpen}
        padding={padding}
        bgColor={bgColor}
        bgImageUrl={bgImageUrl}
        onPaddingChange={setPadding}
        onBgColorChange={setBgColor}
        onBgImageChange={handleBgImgChange} />
      <div ref={canvasWrapRef} className="relative flex flex-1 items-center justify-center overflow-auto bg-muted/30 px-2 py-4 pb-20 sm:px-4 sm:py-6 md:pb-6">
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <canvas ref={canvasElRef} />
        </div>


  {/* ← add this overlay */}
  {loading && (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <span>Loading image…</span>
      </div>
    </div>
  )}

        <div className="fixed bottom-15 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card p-1 shadow-md md:bottom-6">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.05))}
            className="flex size-7  justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-sm font-medium tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, z + 0.05))}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        {cropMode && (
          <div className="fixed bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card p-1 shadow-md md:bottom-6">
            <button
              type="button"
              onClick={cancelCrop}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" /> Cancel
            </button>
            <button
              type="button"
              onClick={applyCrop}
              className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Check className="size-4" /> Apply
            </button>
          </div>
        )}

      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3   px-4 py-3  lg:hidden  bg-[transparent]">
        <button
          type="button"
          onClick={cancel}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Cancel
        </button>
        <SaveMenu onSave={save} filename={filename} menuPlacement="top"/>
      </div>
    </div>
  );
}



// ┌──────────────────────────────────────────┐
// │ React component (FabricCanvas)           │
// │  ┌────────────────────────────────────┐  │
// │  │ fabric.Canvas (scene graph)        │  │ ← fabricRef.current
// │  │  • IText "Edit me"                 │  │
// │  │  • Rect at (80, 80) size 160×110   │  │
// │  │  • PencilBrush path                │  │
// │  │  • FabricImage (background)        │  │
// │  │           │                        │  │
// │  │           ▼ draws onto             │  │
// │  │  ┌──────────────────────────────┐  │  │
// │  │  │ <canvas>  (raw pixels)       │  │  │ ← canvasElRef.current
// │  │  │ a DOM element                │  │  │
// │  │  └──────────────────────────────┘  │  │
// │  └────────────────────────────────────┘  │
// └──────────────────────────────────────────┘
