"use client";
import { Spinner } from "@/components/ui/spinner";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { Check, X } from "lucide-react";

import { EditorToolbar, type Tool } from "./editor-toolbar";
import { SaveMenu } from "./save-menu";
import { SecondaryToolbar } from "./secondary-toolbar";
import { addArrow, addCircle, addRect, addText } from "./shapes";
import { UploadScreen } from "./upload-screen";
import { DiscardChangesDialog } from "./discard-changes";

import { STORAGE, safeSet } from "@/lib/utils";

import {
  rotateCanvas,
  deleteSelectedObjects,
  exportCanvas,
} from "./fabric/canvas-actions";
import { useCanvasHistory } from "./fabric/use-canvas-history";
import { useCanvasInit } from "./fabric/use-canvas-init";
import { useCanvasFit } from "./fabric/use-canvas-fit";
import { useCanvasTool } from "./fabric/use-canvas-tool";
import { useCanvasBackground } from "./fabric/use-canvas-bg";
import { useRoundedCorners } from "./fabric/use-rounded-corners";
import { useCrop } from "./fabric/use-crop";
import { toast } from "sonner";

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const userImageRef = useRef<fabric.FabricImage | null>(null);
  const fitRef = useRef<() => void>(() => { });



  const [padding, setPadding] = useState<number>(() => {
    if (typeof window === "undefined") return 15;
    const v = localStorage.getItem(STORAGE.PADDING);
    return v !== null ? Number(v) : 15;
  });

  const [cornerRadius, setCornerRadius] = useState<number>(() => {
    if (typeof window === "undefined") return 15;
    const v = localStorage.getItem(STORAGE.CORNER_RADIUS);
    return v !== null ? Number(v) : 15;
  });


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
  const [bgGallery, setBgGallery] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE.BG_GALLERY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [bgActiveIndex, setBgActiveIndex] = useState<number | null>(() => {
    if (typeof window === "undefined") return null;
    const v = localStorage.getItem(STORAGE.BG_ACTIVE_INDEX);
    return v === null ? null : Number(v);
  });




  const bgImageUrl =
    bgActiveIndex !== null ? bgGallery[bgActiveIndex] ?? null : null;


  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#ef4444");
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [highlightSize, setHighlightSize] = useState<number>(15);
  const [blurSize, setBlurSize] = useState<number>(15);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [loading, setLoading] = useState(
    () =>
      typeof window !== "undefined" &&
      !!localStorage.getItem(STORAGE.USER_IMAGE),
  );
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [fontSize, setFontSize] = useState<number>(22);

  const [fontFamily, setFontFamily] = useState<string>("Arial");



  const handleSelectBg = (index: number | null) => {
    setBgActiveIndex(index);
    if (index === null) localStorage.removeItem(STORAGE.BG_ACTIVE_INDEX);
    else safeSet(STORAGE.BG_ACTIVE_INDEX, String(index));
  };

 const handleAddBg = (dataUrl: string) => {
  // Always add to in-memory gallery — user can use it this session regardless
  const next = [...bgGallery, dataUrl];
  setBgGallery(next);
  handleSelectBg(next.length - 1);

  // Check 1: single image too big to save by itself
  const imageSizeBytes = new Blob([dataUrl]).size;
  const maxSingleBgBytes = 5 * 1024 * 1024; // 5 MB per image
  if (imageSizeBytes >= maxSingleBgBytes) {
    const sizeMb = (imageSizeBytes / (1024 * 1024)).toFixed(1);
    toast.error("Image too large to save", {
      description: `${sizeMb} MB exceeds the 5 MB per-image limit. This image won't be saved and will be lost on refresh.`,
      duration: 4000,
        closeButton: true,

    });
    return; // skip save attempt — would fail anyway
  }

  // Check 2: total gallery size exceeds browser quota
  const serialized = JSON.stringify(next);
  const err = safeSet(STORAGE.BG_GALLERY, serialized);
  if (err) {
    const totalMb = (new Blob([serialized]).size / (1024 * 1024)).toFixed(1);
    toast.warning("Gallery storage exceeded", {
      description: `Gallery total is ${totalMb} MB, which exceeds the browser's storage limit. Some images may not persist on refresh.`,
      duration: 4000,
        closeButton: true,

    });
  }
};


  const handleRemoveBg = (index: number) => {
    const next = bgGallery.filter((_, i) => i !== index);
    setBgGallery(next);
    safeSet(STORAGE.BG_GALLERY, JSON.stringify(next));
    // if (err) {
    //   toast.error("Couldn't save image", {
    //     description: err.message,
    //     duration: 6000,
    //   });
    // }

    if (bgActiveIndex === index) handleSelectBg(null);
    else if (bgActiveIndex !== null && bgActiveIndex > index)
      handleSelectBg(bgActiveIndex - 1);
  };






  useEffect(() => {
    safeSet(STORAGE.PADDING, String(padding));
  }, [padding]);

  useEffect(() => {
    safeSet(STORAGE.CORNER_RADIUS, String(cornerRadius));
  }, [cornerRadius]);


  const { historyRef, historyIdxRef, pushHistory, restore, resetHistory, canUndo, canRedo } =
    useCanvasHistory(fabricRef,userImageRef,fitRef);


  useCanvasInit({
    imageSrc,
    canvasElRef,
    fabricRef,
    userImageRef,
    fitRef,
    pushHistory,
    setLoading,
    setHasImage,
  });

  const { cropMode, enterCrop, cancelCrop, applyCrop } = useCrop({
    fabricRef,
    userImageRef,
    fitRef,
    pushHistory,
  });

  useRoundedCorners({
    cornerRadius,
    hasImage,
    fabricRef,
    userImageRef,
    fitRef,
    cropMode
  });
 

  useCanvasTool({ tool, color, highlightSize, blurSize, fabricRef,hasImage, cropMode });

  useCanvasFit({
    hasImage,
    padding,
    bgColor,
    canvasWrapRef,
    fabricRef,
    userImageRef,
    fitRef,
    historyRef,
    historyIdxRef,
    setNaturalSize,
  });

  useCanvasBackground({ bgImageUrl, hasImage, fabricRef, fitRef });


  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    const c = fabricRef.current;
    const active = c?.getActiveObject();
    if (c && active instanceof fabric.IText) {
      active.set("fontFamily", family);
      c.requestRenderAll();
      pushHistory();
    }
  };



  const handleFontSizeChange = (n: number) => {
    setFontSize(n);
    const c = fabricRef.current;
    const active = c?.getActiveObject();
    if (c && active instanceof fabric.IText) {
      // Bake any existing scale into fontSize so visible size matches the slider.
      active.set({ fontSize: n, scaleX: 1, scaleY: 1 });
      active.setCoords();
      c.requestRenderAll();
      pushHistory();
    }
  };

  // Sync slider/dropdown to the currently selected text, including
  // after the user resizes it via corner handles (scale changes).
  useEffect(() => {
    if (!hasImage) return;
    const c = fabricRef.current;
    if (!c) return;

    const sync = () => {
      const active = c.getActiveObject();
      if (!(active instanceof fabric.IText)) return;
      const effective = Math.round(
        (active.fontSize ?? 22) * (active.scaleX ?? 1),
      );
      setFontSize(effective);
      if (typeof active.fontFamily === "string") {
        setFontFamily(active.fontFamily);
      }
    };

    c.on("selection:created", sync);
    c.on("selection:updated", sync);
    c.on("object:scaling", sync);
    c.on("object:modified", sync);

    return () => {
      c.off("selection:created", sync);
      c.off("selection:updated", sync);
      c.off("object:scaling", sync);
      c.off("object:modified", sync);
    };
  }, [hasImage, fontSize]);


// Keyboard shortcuts: undo / redo / save / delete
useEffect(() => {
  if (!hasImage) return;

  const isTyping = () => {
    const el = document.activeElement as HTMLElement | null;
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable))
      return true;
    const active = fabricRef.current?.getActiveObject();
    return active instanceof fabric.IText && active.isEditing;
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const c = fabricRef.current;
    if (!c || isTyping()) return;

    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    // Save / export
    if (mod && key === "s") { e.preventDefault(); exportCanvas(c, undefined, filename); return; }

    // Undo / Redo (exit crop first so stale crop lines never linger)
    if (mod && key === "z") { e.preventDefault(); if (cropMode) cancelCrop(); restore(e.shiftKey ? 1 : -1); return; }
    if (mod && key === "y") { e.preventDefault(); if (cropMode) cancelCrop(); restore(1); return; }

    // Delete selected (ignore if nothing is selected)
    if (e.key === "Delete" || e.key === "Backspace") {
      if (c.getActiveObjects().length === 0) return;
      e.preventDefault();
      deleteSelectedObjects(c, userImageRef.current);
      pushHistory();
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [hasImage, filename, restore, pushHistory, fabricRef, userImageRef, cropMode, cancelCrop]);

   


  const uploadFromFile = (file: File) => {
    setLoading(true);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const imageSizeBytes = new Blob([dataUrl]).size;
      const maxSingleBgBytes = 5 * 1024 * 1024; // 5 MB per image (adjust as needed)

      setImageSrc(dataUrl);
      setFilename(file.name);

 if (imageSizeBytes >= maxSingleBgBytes) {
      const sizeMb = (imageSizeBytes / (1024 * 1024)).toFixed(1);
      toast.error(
        `Background image is ${sizeMb} MB (max 5 MB). Large images won't be saved and will be lost on refresh.`,
         { duration: 6000 });
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
  };

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
    if (id === "text") addText(c, color, fontSize, fontFamily);
    else if (id === "rect") addRect(c, color);
    else if (id === "circle") addCircle(c, color);
    else if (id === "arrow") addArrow(c, color);
    if (id !== "pen" && id !== "select") pushHistory();
  };

  const rotate = () => {
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    if (!c || !userImg) return;
    rotateCanvas(c, userImg, padding, fitRef.current);
    pushHistory();
  };

  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    const active = c.getActiveObjects();
    console.log(active);
    if (active.length === 0) return;
    deleteSelectedObjects(c, userImageRef.current);
    pushHistory();
  };

  const cancel = () => {
    setImageSrc(null);
    setFilename("");
    setTool("pen");
    setHasImage(false);
    setBgColor("#ffffff");
    // setBgActiveIndex(null);
    // (keep bgGallery — it's the user's saved library across sessions)
    resetHistory();
    userImageRef.current = null;
    // localStorage.removeItem(STORAGE.BG_ACTIVE_INDEX);
    localStorage.removeItem(STORAGE.FILENAME);
    localStorage.removeItem(STORAGE.USER_IMAGE);
    // Note: NOT removing STORAGE.BG_GALLERY so the library persists
  };

  const save = (targetW?: number, nameOfFile?: string) => {
    const c = fabricRef.current;
    if (!c) return;
    exportCanvas(c, targetW, nameOfFile);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EditorToolbar
        filename={filename}
        tool={tool}
        color={color}
        onTool={handleTool}
        onUndo={() => { if (cropMode) cancelCrop(); restore(-1); }}
        onRedo={() => { if (cropMode) cancelCrop(); restore(1); }}
        onColorChange={setColor}
        onDelete={deleteSelected}
        onCancel={cancel}
        onSave={save}
        onRotate={rotate}
        onCrop={enterCrop}
        padding={padding}
        bgColor={bgColor}
        bgGallery={bgGallery}
        bgActiveIndex={bgActiveIndex}
        onAddBg={handleAddBg}
        onRemoveBg={handleRemoveBg}
        onSelectBg={handleSelectBg}
        onPaddingChange={setPadding}
        onBgColorChange={setBgColor}
        setCornerRadius={setCornerRadius}
        cornerRadius={cornerRadius}
        naturalWidth={naturalSize.w}
        naturalHeight={naturalSize.h}
        cropMode={cropMode}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <SecondaryToolbar
        tool={tool}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        highlightSize={highlightSize}
        onHighlightSizeChange={setHighlightSize}
        fontFamily={fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
        blurSize={blurSize}
        onBlurSizeChange={setBlurSize}
      />
      <div
        ref={canvasWrapRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30 px-2 py-4 pb-20 sm:px-4 sm:py-6 md:pb-6"
      >
        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
          <canvas ref={canvasElRef} />
        </div>

        {loading && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
              <Spinner className="size-8 text-primary" />
            </div>
          </div>
        )}

        {cropMode && (
    <div className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-full border border-border bg-card p-1 shadow-md lg:bottom-[100px]">
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
