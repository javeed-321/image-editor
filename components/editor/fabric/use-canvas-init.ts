import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";
import { STORAGE } from "@/lib/utils";
import { toast } from "sonner";

type Params = {
  imageSrc: string | null;
  canvasElRef: RefObject<HTMLCanvasElement | null>;
  fabricRef: RefObject<fabric.Canvas | null>;
  userImageRef: RefObject<fabric.FabricImage | null>;
  fitRef: RefObject<() => void>;
  pushHistory: () => void;
  setLoading: (v: boolean) => void;
  setHasImage: (v: boolean) => void;
};

export function useCanvasInit({
  imageSrc,
  canvasElRef,
  fabricRef,
  userImageRef,
  fitRef,
  pushHistory,
  setLoading,
  setHasImage,
}: Params) {
  useEffect(() => {
    if (!imageSrc || !canvasElRef.current) return;
    let cancelled = false;

    const c = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: "#ffffff",
    });
    fabricRef.current = c;

    const loadImage = async () => {
      try {
        const img = await fabric.FabricImage.fromURL(imageSrc, {
          crossOrigin: "anonymous",
        });

        if (cancelled) return;

        const w = img.width ?? STORAGE.MAX_W;
        const h = img.height ?? STORAGE.MAX_H;
        const scale = Math.min(STORAGE.MAX_W / w, STORAGE.MAX_H / h, 1);
        userImageRef.current = img;
        img.scale(scale);

        img.set({
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
      (img as any).isUserImage = true ;
        c.add(img);
        c.sendObjectToBack(img);
        c.setDimensions({ width: w * scale, height: h * scale });
        c.requestRenderAll();
        // setLoading(false);
        setHasImage(true);

        requestAnimationFrame(() => {
          fitRef.current();
          setLoading(false);
        });
      } catch {
        toast.error("Couldn't load that image", { description: "It may have moved or blocks loading." });
        // setImageSrc(null);                 
        localStorage.removeItem(STORAGE.USER_IMAGE);
      }

      // finally {
        // setLoading(false);
      // }
    };
    loadImage();

    c.on("path:created", pushHistory);
    c.on("object:modified", pushHistory);

    return () => {
      cancelled = true;
      c.dispose();
      fabricRef.current = null;
    };
  }, [
    imageSrc,
    pushHistory,
    canvasElRef,
    fabricRef,
    userImageRef,
    fitRef,
    setLoading,
    setHasImage,
  ]);
}
