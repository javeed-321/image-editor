import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="flex flex-1 flex-row items-center justify-center px-4 py-24 text-center">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Edit images right in your browser
        </h1>
        <p className="text-balance text-lg text-muted-foreground">
          A lightweight image editor powered by fabric.js. Drop in shapes, text,
          and images on an interactive canvas — no installs, no uploads.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button render={<Link href="/editor" />} size="lg">
            Launch Editor
          </Button>
        </div>
      </div>
    </section>
  );
}
