"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/* ── Shared dialog (single source of truth) ── */
function ConfirmDiscardDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onConfirm, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-xl p-6">
        <DialogHeader className="border-0 -mb-3">
          <DialogTitle className="text-lg font-semibold">
            Discard changes?
          </DialogTitle>
          <DialogDescription className="mt-3 text-sm text-muted-foreground">
            Any changes made will be lost. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="border-0 mt-0 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg py-4 px-5"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-lg bg-red-500 px-5 py-4 text-white hover:bg-red-600"
          >
            Yes, restart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ── Reload guard (F5 / Ctrl+R) ── */


/* ── Cancel button + dialog ── */
export function DiscardChangesDialog({ onConfirm }: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
                <Button
        type="button"
        variant="secondary"
        onClick={() => setOpen(true)}
        className="px-4 hover:bg-secondary/60"
      >
        New Image
      </Button>



      <ConfirmDiscardDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={onConfirm}
      />
    </>
  );
}