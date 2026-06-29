"use client";

import { useEffect, useRef, useState } from "react";
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsDataURL(file);
  });
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
  const imagesInputId = "batch-images-input";
  const bgInputId = "batch-bg-input";

  // Normal images to process
  const [files, setFiles] = useState<File[]>([]);

  // Background images uploaded by the user
  const [bgFiles, setBgFiles] = useState<File[]>([]);
  // Object URLs for thumbnail preview — keyed by file.name
  const bgPreviewUrls = useRef<Map<string, string>>(new Map());
  // Which backgrounds are in the random pool
  const [selectedBgNames, setSelectedBgNames] = useState<Set<string>>(new Set());

  const [padding, setPadding] = useState(() =>
    readSavedNumber(STORAGE.PADDING, 15),
  );
  const [cornerRadius, setCornerRadius] = useState(() =>
    readSavedNumber(STORAGE.CORNER_RADIUS, 15),
  );
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs when dialog closes to avoid memory leaks
  useEffect(() => {
    if (!open) {
      bgPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      bgPreviewUrls.current.clear();
    }
  }, [open]);

  const handleImages = (fileList: FileList | null) => {
    if (!fileList) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    setFiles(images);
    setError(null);
  };

  const handleBgFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const images = Array.from(fileList).filter((f) => f.type.startsWith("image/"));

    // Revoke old preview URLs before replacing
    bgPreviewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    bgPreviewUrls.current.clear();

    // Create preview URLs for the new selection
    images.forEach((f) => {
      bgPreviewUrls.current.set(f.name, URL.createObjectURL(f));
    });

    setBgFiles(images);
    setSelectedBgNames(new Set(images.map((f) => f.name))); // all selected by default
    setError(null);
  };

  const toggleBg = (name: string) => {
    setSelectedBgNames((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const allSelected =
    bgFiles.length > 0 && selectedBgNames.size === bgFiles.length;

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    try {
      // Read selected background files as data URLs (Fabric needs data URLs)
      const selectedBgFiles = bgFiles.filter((f) => selectedBgNames.has(f.name));
      const backgroundUrls = await Promise.all(
        selectedBgFiles.map((f) => readFileAsDataUrl(f)),
      );

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
            Apply padding and rounded corners to multiple images with a randomly
            chosen background, then download as a ZIP.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          {/* ── Section 1: Images to process ── */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Images to process
            </span>
            <label
              htmlFor={imagesInputId}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <Upload className="size-4 shrink-0" />
              {files.length > 0
                ? `${files.length} image${files.length === 1 ? "" : "s"} selected — click to change`
                : "Click to choose images"}
            </label>
            <input
              id={imagesInputId}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={(e) => handleImages(e.target.files)}
            />
          </div>

          {/* ── Section 2: Background images ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Background images — randomly applied
              </span>
              {bgFiles.length > 0 && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline"
                  onClick={() =>
                    allSelected
                      ? setSelectedBgNames(new Set())
                      : setSelectedBgNames(new Set(bgFiles.map((f) => f.name)))
                  }
                >
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>

            <label
              htmlFor={bgInputId}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <Upload className="size-4 shrink-0" />
              {bgFiles.length > 0
                ? `${bgFiles.length} background${bgFiles.length === 1 ? "" : "s"} uploaded — click to change`
                : "Click to choose background images"}
            </label>
            <input
              id={bgInputId}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
              onChange={(e) => handleBgFiles(e.target.files)}
            />

            {/* Thumbnail grid */}
            {bgFiles.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {bgFiles.map((f) => {
                  const checked = selectedBgNames.has(f.name);
                  const previewUrl = bgPreviewUrls.current.get(f.name) ?? "";
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => toggleBg(f.name)}
                      title={f.name}
                      className={cn(
                        "relative aspect-video overflow-hidden rounded-lg border-2 transition-all",
                        checked
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-border opacity-50",
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewUrl}
                        alt={f.name}
                        className="h-full w-full object-cover"
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
            )}

            {bgFiles.length > 0 && selectedBgNames.size === 0 && (
              <p className="text-xs text-muted-foreground">
                No backgrounds selected — solid white background will be used.
              </p>
            )}
          </div>

          {/* ── Padding slider ── */}
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

          {/* ── Corner radius slider ── */}
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

          {/* ── Progress / error ── */}
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
