"use client";

import { useEffect, useState } from "react";
import { Check, Images, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { STORAGE } from "@/lib/utils";
import { batchProcess } from "@/lib/batch-process";
import { buildZip } from "@/lib/zip";

type Props = {
  open: boolean;
  onClose: () => void;
};

function readSavedNumber(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function BatchDialog({ open, onClose }: Props) {
  const inputId = "batch-file-input";

  const [files, setFiles] = useState<File[]>([]);
  const [padding, setPadding] = useState(() =>
    readSavedNumber(STORAGE.PADDING, 15),
  );
  const [cornerRadius, setCornerRadius] = useState(() =>
    readSavedNumber(STORAGE.CORNER_RADIUS, 15),
  );
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Background image selection
  const [bgFilenames, setBgFilenames] = useState<string[]>([]);
  const [selectedBgs, setSelectedBgs] = useState<Set<string>>(new Set());

  // Fetch available backgrounds when dialog opens
  useEffect(() => {
    if (!open) return;
    fetch("/api/backgrounds")
      .then((r) => r.json())
      .then(({ files: names }: { files: string[] }) => {
        setBgFilenames(names);
        setSelectedBgs(new Set(names)); // all selected by default
      })
      .catch(() => {});
  }, [open]);

  const toggleBg = (name: string) => {
    setSelectedBgs((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const allSelected = bgFilenames.length > 0 && selectedBgs.size === bgFilenames.length;
  const noneSelected = selectedBgs.size === 0;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const images = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    setFiles(images);
    setError(null);
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    const backgroundUrls = Array.from(selectedBgs).map(
      (name) => `/api/backgrounds/${encodeURIComponent(name)}`,
    );

    try {
      const results = await batchProcess(
        files,
        { padding, cornerRadius, backgroundUrls },
        (done, total) => setProgress({ done, total }),
      );
      const zipBlob = await buildZip(results);
      triggerDownload(zipBlob, "batch-processed.zip");
      onClose();
      setFiles([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setProcessing(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const handleOpenChange = (v: boolean) => {
    if (!v && !processing) {
      onClose();
      setFiles([]);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="shrink-0 border-b border-border px-5 py-4">
          <DialogTitle>Batch Process Images</DialogTitle>
          <DialogDescription>
            Apply padding and rounded corners to multiple images and download as a ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* File picker */}
          <div>
            <label
              htmlFor={inputId}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <Upload className="size-4 shrink-0" />
              {files.length > 0
                ? `${files.length} image${files.length === 1 ? "" : "s"} selected — click to change`
                : "Click to choose images"}
            </label>
            <input
              id={inputId}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* Background image selector */}
          {bgFilenames.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Background images — randomly applied
                </span>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() =>
                    allSelected
                      ? setSelectedBgs(new Set())
                      : setSelectedBgs(new Set(bgFilenames))
                  }
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {bgFilenames.map((name) => {
                  const checked = selectedBgs.has(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleBg(name)}
                      className={cn(
                        "relative aspect-video overflow-hidden rounded-lg border-2 transition-all",
                        checked
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border opacity-50",
                      )}
                      title={name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/api/backgrounds/${encodeURIComponent(name)}`}
                        alt={name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                      {checked && (
                        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-2.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {noneSelected && (
                <p className="text-xs text-muted-foreground">
                  No backgrounds selected — solid white background will be used.
                </p>
              )}
            </div>
          )}

          {/* Padding slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Padding — <span className="tabular-nums">{padding}px</span>
            </label>
            <Slider
              className="**:data-[slot=slider-track]:h-1.5!"
              value={[padding]}
              min={0}
              max={200}
              step={1}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                if (typeof n === "number") setPadding(n);
              }}
            />
          </div>

          {/* Corner radius slider */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Corner Radius — <span className="tabular-nums">{cornerRadius}px</span>
            </label>
            <Slider
              className="**:data-[slot=slider-track]:h-1.5!"
              value={[cornerRadius]}
              min={0}
              max={300}
              step={1}
              onValueChange={(v) => {
                const n = Array.isArray(v) ? v[0] : v;
                if (typeof n === "number") setCornerRadius(n);
              }}
            />
          </div>

          {/* Progress / error */}
          {processing && (
            <p className="text-sm text-muted-foreground">
              Processing {progress.done} of {progress.total}…
            </p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border px-5 py-4 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              setFiles([]);
              setError(null);
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleProcess}
            disabled={files.length === 0 || processing}
            className="ml-2"
          >
            <Images className="size-4" />
            {processing
              ? `Processing ${progress.done}/${progress.total}…`
              : `Process ${files.length > 0 ? files.length : ""} image${files.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
