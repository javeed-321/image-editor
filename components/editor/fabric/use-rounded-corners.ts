import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";

type Params = {
  cornerRadius: number;
  hasImage: boolean;
  fabricRef: RefObject<fabric.Canvas | null>;
  userImageRef: RefObject<fabric.FabricImage | null>;
  fitRef: RefObject<() => void>;
};

export function useRoundedCorners({
  cornerRadius,
  hasImage,
  fabricRef,
  userImageRef,
  fitRef,
}: Params) {
  useEffect(() => {
    if (!hasImage) return;
    const c = fabricRef.current;
    const img = userImageRef.current;
    if (!c || !img) return;

    img.set({
      clipPath:
        cornerRadius > 0
          ? new fabric.Rect({
              width: img.width ?? 0,
              height: img.height ?? 0,
              rx: cornerRadius,
              ry: cornerRadius,
              originX: "center",
              originY: "center",
            })
          : undefined,
    });
    img.dirty = true;

    img.setCoords();
    c.requestRenderAll();
    fitRef.current?.();
  }, [cornerRadius, hasImage, fabricRef, userImageRef, fitRef]);
}
