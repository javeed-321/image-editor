"use client";

import dynamic from "next/dynamic";

// fabric.js relies on browser APIs (window, document, canvas), so it must not
// be server-rendered. `ssr: false` is only allowed inside a Client Component.
const FabricCanvas = dynamic(() => import("./fabric-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-[800px] max-w-full items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
      Loading canvas…
    </div>
  ),
});

export function Editor() {
  return <FabricCanvas />;
}
