import { useEffect, type RefObject } from "react";
import * as fabric from "fabric";
import { STORAGE } from "@/lib/utils";
import { toast } from "sonner";
import { cssScaleOf, handleStyle } from "../shapes";

// Allow the image's render cache to hold the full canvas resolution
// (canvas is capped at 4000×4000 by STORAGE.MAX_W/MAX_H). Default cap is
// ~2.1MP, which blurs any export larger than ~1448×1448.
fabric.config.perfLimitSizeTotal = 16_777_216; // 4096 × 4096
fabric.config.maxCacheSideLimit = 8192;

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
      // Render the backstore at devicePixelRatio. The raster image gains no
      // detail (the source has no more pixels), but vector text and shapes
      // are resolution-independent and would otherwise look soft on HiDPI
      // screens, where the canvas is stretched past its CSS-pixel backstore.
      // Export is unaffected — toDataURL's multiplier uses the logical width.
      enableRetinaScaling: true,
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

        // The browser's default one-step bilinear downscale blurs fine
        // detail (screenshot text) at the 60–90% display scales we use.
        // A resize filter resamples the original properly whenever the
        // on-screen scale changes; at scale 1 (exports) fabric skips it
        // and draws the untouched original.
        img.resizeFilter = new fabric.filters.Resize();
        img.minimumScaleTrigger = 0.99;

        img.set({
          selectable: false,
          evented: false,
          originX: "center",
          originY: "center",
        });
      (img as fabric.FabricImage & { isUserImage?: boolean }).isUserImage = true;
        c.add(img);
        c.sendObjectToBack(img);
        c.setDimensions({ width: w * scale, height: h * scale });
        c.requestRenderAll();
        setHasImage(true);

        requestAnimationFrame(() => {
          fitRef.current();
          setLoading(false);
        });
      } catch {
        toast.error("Couldn't load that image", { description: "It may have moved or blocks loading." });
        localStorage.removeItem(STORAGE.USER_IMAGE);
      }
    };
    loadImage();

    // Pen/Highlight/Blur strokes are Paths Fabric builds for us — give them
    // the same selection handles as text & the shapes before saving history.
    c.on("path:created", (e) => {
      const path = (e as { path?: fabric.Path }).path;
      if (path) {
        path.set(handleStyle(cssScaleOf(c)));
        path.setCoords();
      }
      pushHistory();
    });
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
