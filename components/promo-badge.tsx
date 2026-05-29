"use client";

import { useState,useEffect } from "react";
import { ArrowUpRight, X } from "lucide-react";

export function PromoBadge() {
  const [hidden, setHidden] = useState(false);

  // Auto-hide the badge 6 seconds after it appears.
  useEffect(() => {
    const timer = setTimeout(() => setHidden(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  if (hidden) return null;


  const dismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHidden(true);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      <a
        href="https://documentation.ai"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="by Documentation.AI — Docs built for humans & AI"
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card pl-3 pr-1 py-1.5 text-xs shadow-md transition-colors hover:bg-muted sm:gap-2.5 sm:pl-4 sm:pr-1.5 sm:py-2 sm:text-sm"
      >
        <span className="flex size-5 items-center justify-center rounded-md bg-orange-500 text-[10px] font-bold text-white sm:size-6 sm:text-xs">
          D
        </span>
        <span className="font-medium">by Documentation.AI</span>
        <span className="hidden text-muted-foreground md:inline">
          — Docs built for humans &amp; AI
        </span>
        <ArrowUpRight className="size-3.5 text-muted-foreground sm:size-4" />
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hide badge"
          className="ml-1 flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted-foreground/10 hover:text-foreground sm:size-6"
        >
          <X className="size-3 sm:size-3.5" />
        </button>
      </a>
    </div>
  );
}
