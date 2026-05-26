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
        fitRef.current();
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [bgImageUrl, hasImage, fabricRef, fitRef]);
}
