import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";

type Params = {
  bgImageUrl: string | null;
  hasImage: boolean;
  fabricRef: RefObject<fabric.Canvas | null>;
  fitRef: RefObject<() => void>;
};

export function useCanvasBackground({
  bgImageUrl,
  hasImage,
  fabricRef,
  fitRef,
}: Params) {
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

        // Size bg ONCE to cover the current canvas — never resized after.
        // Padding changes only affect the user image now, not the bg.
        const z = c.getZoom() || 1;
        const canvasW = c.getWidth() / z;
        const canvasH = c.getHeight() / z;
        const scale = Math.max(
          canvasW / (bgImg.width ?? 1),
          canvasH / (bgImg.height ?? 1),
        );
        bgImg.set({
          scaleX: scale,
          scaleY: scale,
          originX: "center",
          originY: "center",
          left: canvasW / 2,
          top: canvasH / 2,
        });

        c.backgroundImage = bgImg;
        c.requestRenderAll();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage, fabricRef, fitRef]);
}
