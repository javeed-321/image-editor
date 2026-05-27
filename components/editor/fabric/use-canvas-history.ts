import { useCallback, useRef, useState, type RefObject } from "react";
import type * as fabric from "fabric";

export function useCanvasHistory(fabricRef: RefObject<fabric.Canvas | null>) {
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const restoringRef = useRef<boolean>(false);
const [canUndo, setCanUndo] = useState(false)
const [canRedo, setCanRedo] = useState(false)


  const syncButtons = () => {
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  };

  const pushHistory = useCallback(() => {
    const c = fabricRef.current;
    if (!c || restoringRef.current) return;
const json = JSON.stringify(c.toObject(["selectable", "evented"]));
    historyRef.current = historyRef.current.slice(0, historyIdxRef.current + 1);
    historyRef.current.push(json);
    historyIdxRef.current = historyRef.current.length - 1;
        syncButtons();

  }, [fabricRef]);

  const restore = useCallback(
    async (delta: number) => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const nextIndex = historyIdxRef.current + delta;
      const history = historyRef.current;
      if (nextIndex < 0 || nextIndex >= history.length) return;

      try {
        restoringRef.current = true;
        historyIdxRef.current = nextIndex;
        await canvas.loadFromJSON(history[nextIndex]);
        canvas.requestRenderAll();
      } catch (err) {
        console.error("Failed to restore canvas state:", err);
      } finally {
        restoringRef.current = false;
            syncButtons();

      }
      
    },
    [fabricRef],
  );

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    historyIdxRef.current = -1;
        syncButtons();

  }, []);

  return {
    historyRef,
    historyIdxRef,
    restoringRef,
    pushHistory,
    restore,
    resetHistory,
    canUndo,
    canRedo,
  };
}
