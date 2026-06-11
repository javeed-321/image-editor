"use client";

import dynamic from "next/dynamic";
import { Spinner } from "../ui/spinner";

const FabricCanvas = dynamic(() => import("./fabric-canvas"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
      <Spinner className="size-8 text-primary" />
    </div>
  ),
});

console.log("Web Application Schema")

export function Editor() {
  return <FabricCanvas />;
}
