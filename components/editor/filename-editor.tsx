"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onRename: (name: string) => void;
};

// Canva-style inline rename: the title looks like plain text, reveals a
// pencil + background on hover, and swaps to an input on click. Enter or
// clicking away commits; Escape reverts.
export function FilenameEditor({ value, onRename,  }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  // Select just the base name (keep ".png" etc. out of the selection) so
  // typing replaces the name but preserves the extension — OS-rename feel.
  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    const dot = input.value.lastIndexOf(".");
    input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
  }, [editing]);

  const startEdit = () => {
    cancelledRef.current = false;
    setDraft(value || "untitled");
    setEditing(true);
  };

  const commit = () => {
    if (cancelledRef.current) return;
    setEditing(false);
    const next = draft.trim();
    if (next && next !== value) onRename(next);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            inputRef.current?.blur();
          } else if (e.key === "Escape") {
            cancelledRef.current = true;
            setEditing(false);
          }
        }}
        spellCheck={false}
        className={cn(
          "h-8 w-[200px] rounded-lg border border-input bg-background px-2.5 text-sm font-medium outline-none ring-2 ring-ring/40",
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      title="Rename"
      className={cn(
        "group flex h-8 min-w-0 max-w-[200px] items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-muted",
      )}
    >
      <span className="truncate">{value || "Untitled"}</span>
      <Pencil className="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
    </button>
  );
}
