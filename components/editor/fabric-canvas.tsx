"use client";
import { Spinner } from "@/components/ui/spinner";

import { useCallback, useEffect, useRef, useLayoutEffect, useState } from "react";
import * as fabric from "fabric";
import { Check, X } from "lucide-react";

import { EditorToolbar, type Tool } from "./editor-toolbar";
import { SaveMenu } from "./save-menu";
import { addArrow, addCircle, addRect, addText } from "./shapes";
import { UploadScreen } from "./upload-screen";

import {STORAGE,safeSet} from "@/lib/utils"
import { DiscardChangesDialog } from "./discard-changes";


export default function FabricCanvas() {


  

 

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
  const [hasImage, setHasImage] = useState<boolean>(false);
const [padding, setPadding] = useState<number>(15);
const [highlightSize, setHighlightSize] = useState<number>(15);

// 
const handlePaddingChange = (next: number) => {
  setPadding(next);
  // safeSet(STORAGE.PADDING, String(next));
};


  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [loading, setLoading] = useState(() =>
    typeof window !== "undefined" && !!localStorage.getItem(STORAGE.USER_IMAGE)
  );

  const [cornerRadius, setCornerRadius] = useState<number>(15);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });



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

    const loadImage = async () => {
      try {
        const img = await fabric.FabricImage.fromURL(imageSrc, { crossOrigin: "anonymous" });

        if (cancelled) return;

        const w = img.width ?? STORAGE.MAX_W;
        const h = img.height ?? STORAGE.MAX_H;
        const scale = Math.min(STORAGE.MAX_W / w, STORAGE.MAX_H / h, 1);
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
        setLoading(false);
        setHasImage(true);

        requestAnimationFrame(() => {
          fitRef.current();
        });
      } catch {
        setLoading(false);
        console.log("Failed to load image in fabric canvas");
      }
      finally {
        setLoading(false);
      }
    };
    loadImage();

    c.on("path:created", pushHistory);
    c.on("object:modified", pushHistory);

    return () => {
      cancelled = true;
      c.dispose();
      fabricRef.current = null;
    };
  }, [imageSrc, pushHistory]);


  // this code is for the round corners taking from user 

  useEffect(() => {
    if (!hasImage) return;
    const c = fabricRef.current;
    const img = userImageRef.current;
    if (!c || !img) return;

   img.set({
  clipPath:
    cornerRadius > 0
      ? new fabric.Rect({
          width: img.width ?? 0,
          height: img.height ?? 0,
          rx: cornerRadius,
          ry: cornerRadius,
          originX: "center",
          originY: "center",
        })
      : undefined,
});
img.dirty = true;


    img.setCoords();
    c.requestRenderAll();
    fitRef.current?.();
  }, [cornerRadius, hasImage]);


  // this code ends here 



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

      brush.width = highlightSize;
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
  }, [tool, color,highlightSize
  ]);

  useEffect(() => {
    if (!hasImage) return;
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const fit = () => {
      // Read refs at call time, not capture — fitRef.current outlives canvas
      // dispose/recreate cycles (StrictMode, HMR, image swap), so a stale
      // closure pointing at a disposed canvas crashes inside fabric internals.
      const c = fabricRef.current;
      const userImg = userImageRef.current;
      if (!c || !userImg || !(c as unknown as { lowerCanvasEl?: unknown }).lowerCanvasEl) return;

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

      // Measure the wrap's actual inner content box. clientWidth/Height include
      // padding (but exclude borders/scrollbars), so subtract the computed
      // padding to get the area the canvas must fit into. This works because:
      //  · wrap has `min-h-0 flex-1 overflow-hidden`, so it can't grow with
      //    its canvas child and is bounded by its flex parent's height
      //  · wrap's own padding (px-2 py-4 pb-20 sm:px-4 sm:py-6 md:pb-6)
      //    already reserves room for the fixed bottom Discard/Done bar
      // Scaling against this exact box guarantees the canvas never overflows.
      const cs = window.getComputedStyle(wrap);
      const padX =
        (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY =
        (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const availW = Math.max(1, wrap.clientWidth - padX);
      const availH = Math.max(1, wrap.clientHeight - padY);
      const fitZoom = Math.min(availW / framedW, availH / framedH, 1);
      const z = Math.max(0.05, fitZoom);

      c.setZoom(z);
      c.setDimensions({ width: framedW * z, height: framedH * z });
      c.requestRenderAll();

      setNaturalSize((prev) =>
        prev.w === Math.round(framedW) && prev.h === Math.round(framedH)
          ? prev
          : { w: Math.round(framedW), h: Math.round(framedH) },
      );

      if (historyRef.current.length === 0) {
        historyRef.current = [JSON.stringify(c.toJSON())];
        historyIdxRef.current = 0;
      }
    };

    fitRef.current = fit;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [hasImage, padding, bgColor]);


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

      if (file.size > STORAGE.MAX_LOCALSTORAGE_SIZE_BYTES) {
        const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
        console.error(
          `Image is ${sizeMb} MB (max ${STORAGE.MAX_LOCALSTORAGE_SIZE_MB} MB). Not persisted to localStorage — will be lost on reload.`,
        );
        return;
      }

      safeSet(STORAGE.USER_IMAGE, dataUrl);
      safeSet(STORAGE.FILENAME, file.name);
      setLoading(false);
    };
    reader.onerror = () => setLoading(false);

    reader.readAsDataURL(file);
  };



  const uploadFromURL = (url: string) => {
    setLoading(true);
    setImageSrc(url);
    const name = url.split("/").pop() || "image";
    setFilename(name);
    safeSet(STORAGE.USER_IMAGE, url);
    safeSet(STORAGE.FILENAME, name);

    setLoading(false);
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
    setTool("pen");
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
      left: b.left,
      top: b.top,
      width: b.width,
      height: b.height,
      originX: "left",
      originY: "top",
      centeredScaling: false,
      centeredRotation: false,
      lockScalingFlip: true,
      fill: "rgba(59,130,246,0.08)",
      stroke: "#3b82f6",
      strokeDashArray: [6, 4],
      strokeWidth: 2,
      strokeUniform: true,
      cornerColor: "#3b82f6",
      cornerStyle: "circle",
      transparentCorners: false,
      lockRotation: true,
      hasRotatingPoint: false,
    });

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

    // Convert rect (canvas pixels) → source-image pixels.
    const cropX = ((rect.left ?? 0) - imgBounds.left) / scale + (img.cropX ?? 0);
    const cropY = ((rect.top ?? 0) - imgBounds.top) / scale + (img.cropY ?? 0);
    const cropW = rect.getScaledWidth() / scale;
    const cropH = rect.getScaledHeight() / scale;

    img.set({ cropX, cropY, width: cropW, height: cropH });
    img.setCoords();

    c.remove(rect);
    cropRectRef.current = null;
    setCropMode(false);

    pushHistory();
    fitRef.current();
  };



  const save = (targetW?: number, nameOfFile?: string) => {
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
        onRotate={rotate}
        onCrop={enterCrop}
        padding={padding}
        bgColor={bgColor}
        bgImageUrl={bgImageUrl}
        onPaddingChange={handlePaddingChange}
        onBgColorChange={setBgColor}
        onBgImageChange={handleBgImgChange}
        setCornerRadius={setCornerRadius}
        cornerRadius={cornerRadius}
        naturalWidth={naturalSize.w}
        naturalHeight={naturalSize.h}
        cropMode={cropMode}
        highlightSize={highlightSize}
        onHighlightSizeChange={setHighlightSize}
      />
      {/* <ReloadConfirmGuard onConfirm={cancel} /> */}
      <div ref={canvasWrapRef} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30 px-2 py-4 pb-20 sm:px-4 sm:py-6 md:pb-6">
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <canvas ref={canvasElRef} />
        </div>


        {/* ← add this overlay */}
        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <Spinner className="size-8 text-primary" />
              {/* <span>Loading image…</span> */}
            </div>
          </div>
        )}

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
        <DiscardChangesDialog onConfirm={cancel} />

        <SaveMenu
          onSave={save}
          filename={filename}
          naturalWidth={naturalSize.w}
          naturalHeight={naturalSize.h}
          menuPlacement="top"
        />
      </div>

    </div>
  );
}



