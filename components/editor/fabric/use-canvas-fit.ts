import { useCallback, useEffect, useRef, type RefObject } from "react";
import type * as fabric from "fabric";

type Size = { w: number; h: number };

type Params = {
  hasImage: boolean;
  padding: number;
  bgColor: string;
  canvasWrapRef: RefObject<HTMLDivElement | null>;
  fabricRef: RefObject<fabric.Canvas | null>;
  userImageRef: RefObject<fabric.FabricImage | null>;
  fitRef: RefObject<() => void>;
  historyRef: RefObject<string[]>;
  historyIdxRef: RefObject<number>;
  setNaturalSize: (updater: (prev: Size) => Size) => void;
};


export function useCanvasFit({
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
}: Params) {


  // Padding grows the canvas around the image; the image itself always
  // renders at its initial scale, so its pixels are never resampled or
  // distorted by the padding slider. Export size changes with padding.
  // Re-locks when the user image instance changes (initial upload, post-crop).
  const fixedCanvasRef = useRef<{ w: number; h: number } | null>(null);
  const initialScaleRef = useRef<number>(1);
  const lastUserImgRef = useRef<fabric.FabricImage | null>(null);

  useEffect(() => {
    if (!hasImage) return;
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const fit = () => {
      const c = fabricRef.current;
      const userImg = userImageRef.current;
      if (!c || !userImg || !(c as unknown as { lowerCanvasEl?: unknown }).lowerCanvasEl) return;

      // Re-lock canvas + baseline scale whenever the user image instance
      // changes (upload, post-crop). Store UNROTATED display dims so the
      // rotation block below can swap them based on the current angle.
      if (lastUserImgRef.current !== userImg) {
        const initScale = userImg.scaleX ?? 1;
        fixedCanvasRef.current = {
          w: (userImg.width ?? 0) * initScale,
          h: (userImg.height ?? 0) * initScale,
        };
        initialScaleRef.current = initScale;
        lastUserImgRef.current = userImg;
      }

      const base = fixedCanvasRef.current!;
      const initialScale = initialScaleRef.current;

            // Current rotation → swap canvas dims so a rotated image still fits.
      // rotateCanvas() bumps userImg.angle by 90°; we read it here and let
      // canvas + bg follow. No code change to rotateCanvas needed.
      const angle = (((userImg.angle ?? 0) % 360) + 360) % 360;
      const rotated = angle === 90 || angle === 270;

      // Frame = image display bounds + padding on all four sides. The image
      // keeps its baseline scale on BOTH axes: no shrink, no stretch.
      const canvasW = (rotated ? base.h : base.w) + 2 * padding;
      const canvasH = (rotated ? base.w : base.h) + 2 * padding;

      userImg.set({
        scaleX: initialScale,
        scaleY: initialScale,
        originX: "center",
        originY: "center",
        left: canvasW / 2,
        top: canvasH / 2,
      });
      userImg.setCoords();


      // Bg fills the (possibly rotated) canvas. Sync its angle to the user
      // image so they rotate together. When rotated, bg.height becomes the
      // visible width and bg.width becomes the visible height — the cover-
      // scale formula uses the post-rotation dims.
      const bg = c.backgroundImage;
      if (bg && typeof bg !== "string") {
        const bgVisW = rotated ? (bg.height ?? 1) : (bg.width ?? 1);
        const bgVisH = rotated ? (bg.width ?? 1) : (bg.height ?? 1);
        const bgScale = Math.max(canvasW / bgVisW, canvasH / bgVisH);
        bg.set({
          angle,
          scaleX: bgScale,
          scaleY: bgScale,
          originX: "center",
          originY: "center",
          left: canvasW / 2,
          top: canvasH / 2,
        });
      }

      c.backgroundColor = bgColor;

      const cs = window.getComputedStyle(wrap);
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const availW = Math.max(1, wrap.clientWidth - padX);
      const availH = Math.max(1, wrap.clientHeight - padY);
      const s = Math.max(0.05, Math.min(availW / canvasW, availH / canvasH, 1));

      // Backstore stays at full native resolution (also the export size);
      // only the element is shrunk to fit the viewport, via CSS, where the
      // browser downscales at high quality. No internal zoom — fabric's
      // pointer math reads the css/backstore ratio by itself.
      c.setDimensions({ width: canvasW, height: canvasH }, { backstoreOnly: true });
      c.setDimensions(
        { width: `${Math.round(canvasW * s)}px`, height: `${Math.round(canvasH * s)}px` },
        { cssOnly: true },
      );
      c.requestRenderAll();

      setNaturalSize((prev) =>
        prev.w === Math.round(canvasW) && prev.h === Math.round(canvasH)
          ? prev
          : { w: Math.round(canvasW), h: Math.round(canvasH) },
      );
      if (historyRef.current.length === 0) {
        historyRef.current = [JSON.stringify(c.toObject(["selectable", "evented"]))];
        historyIdxRef.current = 0;
      }
    };

    fitRef.current = fit;
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [
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
  ]);

  // Force the next fit() to re-lock canvas dims to the current user image.
  // Called after crop/resize-like mutations where the image instance stays
  // the same but its dimensions changed.
  const relock = useCallback(() => {
    lastUserImgRef.current = null;
  }, []);

  return { relock };
}
