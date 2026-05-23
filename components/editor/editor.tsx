"use client";

import dynamic from "next/dynamic";

const FabricCanvas = dynamic(() => import("./fabric-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      Loading editor…
    </div>
  ),
});

export function Editor() {
  return <FabricCanvas />;
}
