import { useEffect, type RefObject } from "react";
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

// Sizes the canvas and lays out the user image + background, then scales the
// whole canvas to fit the viewport.
//
//   User image: never scaled here. It keeps whatever scale it had at load /
//   crop time. fit() only positions it.
//
//   Canvas: hugs the user image plus `padding` on every side.
//
//   Background image (if any): stretched to fill the whole canvas. Shows
//   through the padding margin around the user image and through any
//   rounded-corner cut-outs.
//
// After sizing, the canvas is zoomed so it fits the wrap on any screen.
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
  useEffect(() => {
    if (!hasImage) return;
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const fit = () => {
      // Read refs at call time — fitRef.current outlives canvas dispose/
      // recreate cycles, so a captured closure can point at a disposed canvas.
      const c = fabricRef.current;
      const userImg = userImageRef.current;
      if (!c || !userImg || !(c as unknown as { lowerCanvasEl?: unknown }).lowerCanvasEl) return;

      // Canvas always hugs the user image plus padding. User image stays at
      // its current scale — we only move it to the new center.
      const bounds = userImg.getBoundingRect();
      const canvasW = bounds.width + 2 * padding;
      const canvasH = bounds.height + 2 * padding;

      userImg.set({ left: canvasW / 2, top: canvasH / 2 });
      userImg.setCoords();

      // Background fills the whole canvas. It shows through the padding
      // margin around the user image, and through rounded-corner cut-outs.
      const bg = c.backgroundImage;
      if (bg && typeof bg !== "string") {
        bg.set({
          scaleX: canvasW / (bg.width ?? 1),
          scaleY: canvasH / (bg.height ?? 1),
          originX: "left",
          originY: "top",
          left: 0,
          top: 0,
        });
      }

      c.backgroundColor = bgColor;

      // Fit the canvas inside the wrap's inner content box. clientWidth/
      // Height already exclude borders and scrollbars but include padding,
      // so subtract the computed padding.
      const cs = window.getComputedStyle(wrap);
      const padX = (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const padY = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      const availW = Math.max(1, wrap.clientWidth - padX);
      const availH = Math.max(1, wrap.clientHeight - padY);
      const zoom = Math.max(0.05, Math.min(availW / canvasW, availH / canvasH, 1));

      c.setZoom(zoom);
      c.setDimensions({ width: canvasW * zoom, height: canvasH * zoom });
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
}
