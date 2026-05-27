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
      // Read refs at call time, not capture — fitRef.current outlives canvas
      // dispose/recreate cycles (StrictMode, HMR, image swap), so a stale
      // closure pointing at a disposed canvas crashes inside fabric internals.
      const c = fabricRef.current;
      const userImg = userImageRef.current;
      if (
        !c ||
        !userImg ||
        !(c as unknown as { lowerCanvasEl?: unknown }).lowerCanvasEl
      )
        return;

      // Read the AABB after rotation — width/height auto-swap for 90/270°
      const bounds = userImg.getBoundingRect();
      const framedW = bounds.width + 2 * padding;
      const framedH = bounds.height + 2 * padding;

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
      // padding to get the area the canvas must fit into.
      const cs = window.getComputedStyle(wrap);
      const padX =
        (parseFloat(cs.paddingLeft) || 0) +
        (parseFloat(cs.paddingRight) || 0);
      const padY =
        (parseFloat(cs.paddingTop) || 0) +
        (parseFloat(cs.paddingBottom) || 0);
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
