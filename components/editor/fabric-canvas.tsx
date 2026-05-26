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

export default function FabricCanvas() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const userImageRef = useRef<fabric.FabricImage | null>(null);
  const fitRef = useRef<() => void>(() => {});

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
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [loading, setLoading] = useState(
    () =>
      typeof window !== "undefined" &&
      !!localStorage.getItem(STORAGE.USER_IMAGE),
  );
  const [cornerRadius, setCornerRadius] = useState<number>(15);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [fontSize, setFontSize] = useState<number>(22);

    const [fontFamily, setFontFamily] = useState<string>("Arial");


  

  const { historyRef, historyIdxRef, pushHistory, restore, resetHistory } =
    useCanvasHistory(fabricRef);

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

  useRoundedCorners({
    cornerRadius,
    hasImage,
    fabricRef,
    userImageRef,
    fitRef,
  });

  useCanvasTool({ tool, color, highlightSize, fabricRef });

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

  const { cropMode, enterCrop, cancelCrop, applyCrop } = useCrop({
    fabricRef,
    userImageRef,
    fitRef,
    pushHistory,
  });

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
  }, [hasImage,fontSize]);

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
  };

  const deleteSelected = () => {
    const c = fabricRef.current;
    if (!c) return;
    deleteSelectedObjects(c, userImageRef.current);
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

    resetHistory();
    userImageRef.current = null;
    localStorage.removeItem(STORAGE.BG_IMAGE);
    localStorage.removeItem(STORAGE.FILENAME);
    localStorage.removeItem(STORAGE.USER_IMAGE);
  };

  const save = (targetW?: number, nameOfFile?: string) => {
    const c = fabricRef.current;
    if (!c) return;
    exportCanvas(c, targetW, nameOfFile);
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
        onPaddingChange={setPadding}
        onBgColorChange={setBgColor}
        onBgImageChange={handleBgImgChange}
        setCornerRadius={setCornerRadius}
        cornerRadius={cornerRadius}
        naturalWidth={naturalSize.w}
        naturalHeight={naturalSize.h}
        cropMode={cropMode}
      />
      <SecondaryToolbar
        tool={tool}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        highlightSize={highlightSize}
        onHighlightSizeChange={setHighlightSize}
        fontFamily={fontFamily}
        onFontFamilyChange={handleFontFamilyChange}
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
