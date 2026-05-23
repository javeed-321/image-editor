import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ImageIcon className="size-5" />
          <span>ImageEditor</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Button render={<Link href="/" />} variant="ghost" size="sm">
            Home
          </Button>
          <Button render={<Link href="/editor" />} size="sm">
            Open Editor
          </Button>
        </nav>
      </div>
    </header>
  );
}
