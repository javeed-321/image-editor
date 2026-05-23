import type { Metadata } from "next";
import { Editor } from "@/components/editor/editor";

export const metadata: Metadata = {
  title: "Editor · ImageEditor",
  description: "Interactive fabric.js canvas editor.",
};

export default function EditorPage() {
  return (
    <section className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Editor</h1>
        <p className="text-sm text-muted-foreground">
          Add shapes and text, then drag, resize, and rotate them on the canvas.
        </p>
      </div>
      <Editor />
    </section>
  );
}
