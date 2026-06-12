"use client";
import { cn } from "@/lib/utils";

import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
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
  measureExportBytes,
  type ExportOptions,
} from "./fabric/canvas-actions";
import { useCanvasHistory } from "./fabric/use-canvas-history";
import { useCanvasInit } from "./fabric/use-canvas-init";
import { useCanvasFit, type BgFit } from "./fabric/use-canvas-fit";
import { useCanvasTool } from "./fabric/use-canvas-tool";
import { useCanvasBackground } from "./fabric/use-canvas-bg";
import { useRoundedCorners } from "./fabric/use-rounded-corners";
import { useCrop } from "./fabric/use-crop";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { Spinner } from "../ui/spinner";

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


  // Live `padding` drives the slider; `debouncedPadding` lags behind so the
  // expensive canvas re-fit + persistence only run once the user stops dragging.
  const [debouncedPadding, setDebouncedPadding] = useState<number>(padding);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedPadding(padding), 350);
    return () => clearTimeout(id);
  }, [padding]);


  const [cornerRadius, setCornerRadius] = useState<number>(() => {
    if (typeof window === "undefined") return 15;
    const v = localStorage.getItem(STORAGE.CORNER_RADIUS);
    return v !== null ? Number(v) : 15;
  });

  const [debouncedCornerRadius, setDebouncedCornerRadius] =
    useState<number>(cornerRadius);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedCornerRadius(cornerRadius), 350);
    return () => clearTimeout(id);
  }, [cornerRadius]);

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

  const [bgFit, setBgFit] = useState<BgFit>(() => {
    if (typeof window === "undefined") return "fill";
    return localStorage.getItem(STORAGE.BG_FIT) === "fit" ? "fit" : "fill";
  });

  const handleBgFitChange = (mode: BgFit) => {
    setBgFit(mode);
    safeSet(STORAGE.BG_FIT, mode);
  };


  const [tool, setTool] = useState<Tool>("select");
  const [color, setColor] = useState<string>("#ef4444");
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [highlightSize, setHighlightSize] = useState<number>(15);
  const [blurSize, setBlurSize] = useState<number>(15);
  const [bgColor, setBgColor] = useState<string>(() => {
    if (typeof window === "undefined") return "#ffffff";
    return localStorage.getItem(STORAGE.BG_COLOR) ?? "#ffffff";
  });
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



  // Updates state immediately (canvas repaints live) but debounces the
  // localStorage write — the custom color picker fires on every drag tick.
  const bgColorSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleBgColorChange = (color: string) => {
    setBgColor(color);
    if (bgColorSaveTimer.current) clearTimeout(bgColorSaveTimer.current);
    bgColorSaveTimer.current = setTimeout(() => {
      safeSet(STORAGE.BG_COLOR, color);
    }, 350);
  };

  const handleSelectBg = (index: number | null) => {
    setBgActiveIndex(index);
    if (index === null) localStorage.removeItem(STORAGE.BG_ACTIVE_INDEX);
    else safeSet(STORAGE.BG_ACTIVE_INDEX, String(index));
  };

  const handleAddBg = (dataUrl: string) => {
    // 1. Always add to in-memory gallery — usable this session regardless.
    const next = [...bgGallery, dataUrl];
    setBgGallery(next);
    handleSelectBg(next.length - 1);

    // 2. Try to persist the gallery. Two failure modes:
    //    (a) the new image alone is over our per-image budget;
    //    (b) the combined gallery exceeds browser quota.
    const imageSizeBytes = new Blob([dataUrl]).size;
    const limitMb = (STORAGE.MAX_PERSISTED_IMAGE_BYTES / (1024 * 1024)).toFixed(0);

    if (imageSizeBytes >= STORAGE.MAX_PERSISTED_IMAGE_BYTES) {
      const sizeMb = (imageSizeBytes / (1024 * 1024)).toFixed(1);
      toast.warning("Background won't survive refresh", {
        description: `${sizeMb} MB exceeds the ${limitMb} MB per-image budget. Use it now or replace with a smaller file.`,
        duration: 4000,
        closeButton: true,
      });
      return;
    }

    const serialized = JSON.stringify(next);
    const err = safeSet(STORAGE.BG_GALLERY, serialized);
    if (err) {
      const totalMb = (new Blob([serialized]).size / (1024 * 1024)).toFixed(1);
      toast.warning("Background gallery won't survive refresh", {
        description: `Gallery is ${totalMb} MB, over browser storage budget. Newer items may not persist.`,
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
    safeSet(STORAGE.PADDING, String(debouncedPadding));
  }, [debouncedPadding]);

  useEffect(() => {
    safeSet(STORAGE.CORNER_RADIUS, String(debouncedCornerRadius));
  }, [debouncedCornerRadius]);


  const { historyRef, historyIdxRef, pushHistory, restore, resetHistory, canUndo, canRedo } =
    useCanvasHistory(fabricRef, userImageRef, fitRef);


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

  const { relock } = useCanvasFit({
    hasImage,
    padding: debouncedPadding,
    bgColor,
    bgFit,
    canvasWrapRef,
    fabricRef,
    userImageRef,
    fitRef,
    historyRef,
    historyIdxRef,
    setNaturalSize,
  });

  const { cropMode, enterCrop, cancelCrop, applyCrop } = useCrop({
    fabricRef,
    userImageRef,
    fitRef,
    pushHistory,
    relock,
  });

  useRoundedCorners({
    cornerRadius: debouncedCornerRadius,
    hasImage,
    fabricRef,
    userImageRef,
    cropMode
  });


  useCanvasTool({ tool, color, highlightSize, blurSize, fabricRef, hasImage, cropMode, });

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
        (active.fontSize ?? 34) * (active.scaleX ?? 1),
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
      if (mod && key === "s") { e.preventDefault(); exportCanvas(c, { filename }); return; }

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

      // 1. Always let the user edit, regardless of size.
      setImageSrc(dataUrl);
      setFilename(file.name);
      safeSet(STORAGE.FILENAME, file.name);

      // 2. Try to persist the image so it survives a refresh.
      //    Two ways this can fail:
      //      (a) image larger than our per-image budget (we skip the
      //          write — it would fail anyway and may evict other keys);
      //      (b) browser quota exhausted across all keys.
      //    Either way, warn the user so they know to save before closing.
      const imageSizeBytes = new Blob([dataUrl]).size;
      const tooLarge = imageSizeBytes >= STORAGE.MAX_PERSISTED_IMAGE_BYTES;
      const err = tooLarge ? null : safeSet(STORAGE.USER_IMAGE, dataUrl);

      if (tooLarge || err) {
        const sizeMb = (imageSizeBytes / (1024 * 1024)).toFixed(1);
        const limitMb = (STORAGE.MAX_PERSISTED_IMAGE_BYTES / (1024 * 1024)).toFixed(0);
        toast.warning("Image won't survive refresh", {
          description: `${sizeMb} MB exceeds the ${limitMb} MB browser-storage budget. Save your work before closing the tab.`,
          duration: 6000,
          closeButton: true,
        });
      }
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
    // setLoading(false);
  };

  // Stable identity so SaveMenu's debounced size-measuring effect doesn't
  // re-fire on every parent re-render. Must stay above the early return —
  // hooks after a conditional return crash once imageSrc flips.
  const measureSize = useCallback((opts: ExportOptions) => {
    const c = fabricRef.current;
    return c ? measureExportBytes(c, opts) : null;
  }, []);

  if (!imageSrc) {
    return (
      <UploadScreen
        onLoadFromFile={uploadFromFile}
        onLoadFromUrl={uploadFromURL}
      />
    );
  }

  const handleTool = (id: Tool) => {
    if(cropMode) cancelCrop() 
    setTool(id);
    const c = fabricRef.current;
    if (!c) return;
    if (id === "text") addText(c, color, fontSize, fontFamily);
    else if (id === "rect") addRect(c, color);
    else if (id === "circle") addCircle(c, color);
    else if (id === "arrow") addArrow(c, color);
    if (id !== "pen" && id !== "select") pushHistory();
  };

  const rename = (name: string) => {
    setFilename(name);
    safeSet(STORAGE.FILENAME, name);
  };

  const rotate = () => {
    const c = fabricRef.current;
    const userImg = userImageRef.current;
    if (!c || !userImg) return;
    rotateCanvas(c, userImg, fitRef.current);
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
    if (bgColorSaveTimer.current) clearTimeout(bgColorSaveTimer.current);
    localStorage.removeItem(STORAGE.FILENAME);
    localStorage.removeItem(STORAGE.USER_IMAGE);
    localStorage.removeItem(STORAGE.BG_COLOR);
    // Note: NOT removing STORAGE.BG_GALLERY so the library persists
  };

  const save = (opts: ExportOptions = {}) => {
    const c = fabricRef.current;
    if (!c) return;
    exportCanvas(c, opts);
  };

  // Cap export at the user image's source resolution — beyond this Fabric
  // would upscale and the image would pixelate. Shapes/text scale freely.
  const imgScaleX = userImageRef.current?.scaleX ?? 1;
  const maxSafeWidth = Math.round(
    naturalSize.w / Math.max(imgScaleX, 0.0001),
  );
  //naturalSize is the canvas native logical width hwich image is fitted into canvas 
  //scaleX is how much the image is scaled down to fit into canvas, so dividing native width by scaleX gives us the original image width which is the max safe width for export to avoid pixelation. 

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <EditorToolbar
        filename={filename}
        onRename={rename}
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
        onCrop={()=>{
          enterCrop();
          setTool("select");
        }}
        onCancelCrop={cancelCrop}

        padding={padding}
        bgColor={bgColor}
        bgGallery={bgGallery}
        bgActiveIndex={bgActiveIndex}
        bgFit={bgFit}
        onBgFitChange={handleBgFitChange}
        onAddBg={handleAddBg}
        onRemoveBg={handleRemoveBg}
        onSelectBg={handleSelectBg}
        onPaddingChange={setPadding}
        onBgColorChange={handleBgColorChange}
        setCornerRadius={setCornerRadius}
        cornerRadius={cornerRadius}
        cropMode={cropMode}
        canUndo={canUndo}
        canRedo={canRedo}
        nativeWidth={naturalSize.w}
        nativeHeight={naturalSize.h}
        maxSafeWidth={maxSafeWidth}
        onMeasureSize={measureSize}
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
        cropMode={cropMode}
        onCancelCrop={cancelCrop}
        onApplyCrop={applyCrop}
      />
      <div
        ref={canvasWrapRef}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-muted/30 px-2 py-4 pb-20 sm:px-4 sm:py-6 md:pb-6"
      >
              <div
          className={cn(
            "overflow-hidden rounded-lg border border-border bg-white shadow-sm transition-opacity duration-300 ease-out",
            loading ? "opacity-0" : "opacity-100",
          )}
        >
          <canvas ref={canvasElRef} />
        </div>

        {loading && (
          <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center px-4 py-6 sm:px-8 sm:py-10">
    <Spinner className="size-8 text-primary" />
          </div>
        )}


    

      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3   px-4 py-3  lg:hidden  bg-[transparent]">
        <DiscardChangesDialog onConfirm={cancel} />

        <SaveMenu
          onSave={save}
          filename={filename}
          nativeWidth={naturalSize.w}
          nativeHeight={naturalSize.h}
          maxSafeWidth={maxSafeWidth}
          onMeasureSize={measureSize}
        />
      </div>
    </div>
  );
}
