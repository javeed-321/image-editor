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
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const restoringRef = useRef<boolean>(false);
  const userImageRef = useRef<fabric.FabricImage | null>(null);

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

  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#ef4444");
  const [zoom, setZoom] = useState<number>(1);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [padding, setPadding] = useState<number>(0);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
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
        userImageRef.current = img;
        img.scale(scale);
        img.set({
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
        c.add(img);
        // c.sendObjectToBack(img);
        c.setDimensions({ width: w * scale, height: h * scale });
        c.requestRenderAll();
        historyRef.current = [JSON.stringify(c.toJSON())];
        historyIdxRef.current = 0;
        setHasImage(true);
      })
      .catch(() => { });

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
    } else {
      c.isDrawingMode = false;
    }
  }, [tool, color]);

  // this runs when padding changes synchronous rescales it 
  useEffect(() => {
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    if (!hasImage || !c || !userImg) return;


    // Read the AABB after rotation — width/height auto-swap for 90/270°
    const bounds = userImg.getBoundingRect();
    const imgW = bounds.width;
    const imgH = bounds.height;

    const framedW = imgW + 2 * padding;
    const framedH = imgH + 2 * padding;

    // Center the image inside the framed canvas (pivot is its center)
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

    c.setZoom(zoom);
    c.setDimensions({ width: framedW * zoom, height: framedH * zoom });
    c.requestRenderAll();
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
        const userImg = userImageRef.current;
        const imgW = (userImg?.width ?? 0) * (userImg?.scaleX ?? 1);
        const imgH = (userImg?.height ?? 0) * (userImg?.scaleY ?? 1);
        const framedW = imgW + 2 * padding;
        const framedH = imgH + 2 * padding;
        bgImg.set({
          scaleX: framedW / (bgImg.width ?? 1),
          scaleY: framedH / (bgImg.height ?? 1),
        });
        c.backgroundImage = bgImg;
        c.requestRenderAll();
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage, padding]);


  const uploadFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageSrc(dataUrl);
      setFilename(file.name);
      safeSet(STORAGE.USER_IMAGE, dataUrl);   // ← new
      safeSet(STORAGE.FILENAME, file.name);   // ← new
    };

    reader.readAsDataURL(file);
  };


  const uploadFromURL = (url: string) => {
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

    // Resize the actual <canvas> element to the swapped dims (apply zoom).
    c.setDimensions({ width: newW * zoom, height: newH * zoom });

    // Rescale the bg image to fit the new framed area.
    const bg = c.backgroundImage;
    if (bg && typeof bg !== "string") {
      bg.set({
        scaleX: newW / (bg.width ?? 1),
        scaleY: newH / (bg.height ?? 1),
      });
    }

    c.requestRenderAll();
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
        onRotate={rotate}

      />
      <BackgroundDialog
        open={bgDialogOpen}
        onOpenChange={setBgDialogOpen}
        padding={padding}
        bgColor={bgColor}
        bgImageUrl={bgImageUrl}
        onPaddingChange={setPadding}
        onBgColorChange={setBgColor}
        onBgImageChange={(url) => {
          setBgImageUrl(url);
          if (url) safeSet(STORAGE.BG_IMAGE, url);
          else localStorage.removeItem(STORAGE.BG_IMAGE);
        }} />
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
            onClick={() => setZoom((z) => Math.min(2, z + 0.10))}
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
