"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

import { BackgroundDialog } from "./background-dialog";
import { EditorToolbar, type Tool } from "./editor-toolbar";
import { addArrow, addCircle, addRect, addText } from "./shapes";
import { UploadScreen } from "./upload-screen";

const MAX_W = 1100;
const MAX_H = 2000;

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const restoringRef = useRef<boolean>(false);
  const baseDimsRef = useRef<{ w: number; h: number } | null>(null);
  const userImageRef = useRef<fabric.FabricImage | null>(null);
  const userImageDimsRef = useRef<{ w: number; h: number } | null>(null);
  const bgImageObjRef = useRef<fabric.FabricImage | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#ef4444");
  const [zoom, setZoom] = useState<number>(1);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [padding, setPadding] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [bgImageUrl, setBgImageUrl] = useState<string | null>(null);
  const [bgDialogOpen, setBgDialogOpen] = useState<boolean>(false);

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
        const baseW = w * scale;
        const baseH = h * scale;
        userImageDimsRef.current = { w: baseW, h: baseH };
        userImageRef.current = img;
        baseDimsRef.current = { w: baseW, h: baseH };
        img.scale(scale);
        img.set({ selectable: false, evented: false });
        c.add(img);
        c.sendObjectToBack(img);
        c.setDimensions({ width: baseW, height: baseH });
        c.requestRenderAll();
        historyRef.current = [JSON.stringify(c.toJSON())];
        historyIdxRef.current = 0;
        setHasImage(true);
      })
      .catch(() => {});

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
      brush.width =4;
      c.freeDrawingBrush = brush;
    } else {
      c.isDrawingMode = false;
    }
  }, [tool, color]);

  useEffect(() => {
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    const imgDims = userImageDimsRef.current;
    if (!hasImage || !c || !userImg || !imgDims) return;

    const framedW = imgDims.w + 2 * padding;
    const framedH = imgDims.h + 2 * padding;
    baseDimsRef.current = { w: framedW, h: framedH };

    userImg.set({ left: padding, top: padding });
    userImg.setCoords();

    c.backgroundColor = bgColor;

    const bgImg = bgImageObjRef.current;
    if (bgImg) {
      bgImg.set({
        scaleX: framedW / (bgImg.width ?? 1),
        scaleY: framedH / (bgImg.height ?? 1),
      });
    }

    c.setZoom(zoom);
    c.setDimensions({ width: framedW * zoom, height: framedH * zoom });
    c.requestRenderAll();
  }, [hasImage, padding, bgColor, zoom]);

  useEffect(() => {
    const c = fabricRef.current;
    if (!c || !hasImage) return;

    if (!bgImageUrl) {
      bgImageObjRef.current = null;
      c.backgroundImage = undefined;
      c.requestRenderAll();
      return;
    }

    let cancelled = false;
    fabric.FabricImage.fromURL(bgImageUrl, { crossOrigin: "anonymous" })
      .then((bgImg) => {
        if (cancelled) return;
        bgImageObjRef.current = bgImg;
        const dims = baseDimsRef.current;
        if (dims) {
          bgImg.set({
            scaleX: dims.w / (bgImg.width ?? 1),
            scaleY: dims.h / (bgImg.height ?? 1),
          });
        }
        c.backgroundImage = bgImg;
        c.requestRenderAll();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage]);


  const uploadFromFile=(file:File) => {
          const reader = new FileReader();
          reader.onload = () => {
            setImageSrc(reader.result as string);
            setFilename(file.name);
          };
          reader.readAsDataURL(file);
    }

    const uploadFromURL =(url:string) => {
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
  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    c.getActiveObjects().forEach((o) => c.remove(o));
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
    baseDimsRef.current = null;
    userImageRef.current = null;
    userImageDimsRef.current = null;
    bgImageObjRef.current = null;
  };

  const save = () => {
    const c = fabricRef.current;
    if (!c) return;
    const data = c.toDataURL({ format: "png", multiplier: 1 });
    const a = document.createElement("a");
    a.href = data;
    a.download = filename || "edited.png";
    a.click();
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
      />
      <BackgroundDialog
        open={bgDialogOpen}
        onOpenChange={setBgDialogOpen}
        padding={padding}
        bgColor={bgColor}
        bgImageUrl={bgImageUrl}
        onPaddingChange={setPadding}
        onBgColorChange={setBgColor}
        onBgImageChange={setBgImageUrl}
      />
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-muted/30 px-4 py-6">
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <canvas ref={canvasElRef} />
        </div>
        <div className="fixed bottom-6 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-card p-1 shadow-md">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.25, z - 0.10))}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="min-w-[3ch] text-center text-sm font-medium tabular-nums">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(3, z + 0.10))}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
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
