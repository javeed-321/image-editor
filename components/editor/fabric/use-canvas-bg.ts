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

        c.backgroundImage = bgImg;
        // fit() owns the cover math: uniform scale = max(canvasW/bgW,
        // canvasH/bgH), centered, overflow cropped — and it syncs the bg
        // angle to the user image, so a background picked on a rotated
        // canvas comes in rotated instead of snapping on the next re-fit.
        fitRef.current();
        c.requestRenderAll();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage, fabricRef, fitRef]);
}
