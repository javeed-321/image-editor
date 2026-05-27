"use client";

import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Circle as CircleIcon,
  Crop,
  Download,
  EyeOff,
  Frame,
  Highlighter,
  Link as LinkIcon,
  Pen,
  Redo2,
  RotateCw,
  Square,
  Trash2,
  Type,
  Undo2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { LandingContent } from "./landing";

const PREVIEW_SHAPE_TOOLS = [
  { id: "pen", label: "Pen", Icon: Pen },
  { id: "text", label: "Text", Icon: Type },
  { id: "highlight", label: "Highlight", Icon: Highlighter },
  { id: "blur", label: "Blur", Icon: EyeOff },
  { id: "rect", label: "Rectangle", Icon: Square },
  { id: "circle", label: "Circle", Icon: CircleIcon },
  { id: "arrow", label: "Arrow", Icon: ArrowUpRight },
];

const PREVIEW_ACTION_TOOLS = [
  { id: "crop", label: "Crop", Icon: Crop },
  { id: "rotate", label: "Rotate", Icon: RotateCw },
  { id: "background", label: "Background", Icon: Frame },
  { id: "delete", label: "Delete", Icon: Trash2 },
];

type Props = {
  onLoadFromFile: (file: File) => void;
  onLoadFromUrl: (url: string) => void;
};
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner";

export function UploadScreen({ onLoadFromFile, onLoadFromUrl }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewHint, setPreviewHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePreviewToolClick = () => {
    setPreviewHint(true);
    hintTimerRef.current = setTimeout(() => setPreviewHint(false), 2000);
    toast("Please Upload an Image", {
      position: "top-center",
      style: {

      }
    });
  };

  const pickFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Please choose an image file (PNG, JPG, GIF, or WebP).");
      return;
    }

    setFileError(null);
    onLoadFromFile(file);
  };
  const [loading, setLoading] = useState(false);
  const handleUrlSubmit = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setLoading(true);
    setUrlError(null);

    const probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = () => {
      setLoading(false);
      onLoadFromUrl(trimmed);
      setShowUrlDialog(false);
      setUrlInput("");
    };
    probe.onerror = () => {
      setLoading(false);
      setShowUrlDialog(false);
      setUrlError("Image is not downloadable. Check the URL or try another image.");
    };
    probe.src = trimmed;
  };

  return (
    <div className="flex flex-1  min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-2 md:gap-4 md:px-4 md:py-3">
        <a
          href="https://documentation.ai/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="by Documentation.AI"
          className="hidden shrink-0 items-center gap-2 transition-opacity hover:opacity-80 md:flex"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://blob-cdn.documentation.ai/org-53a37986-2c9e-4094-b9e8-1e1ffae9e9ee/doc-b389b141-ae58-4fd5-91f9-6702fae9ac58/1767703565522-24h54tbc4tf-logo_light_mode.svg?auto=format%2Ccompress&w=1920"
            alt="Documentation.AI"
            className="h-8 w-auto shrink-0"
            loading="lazy"
            decoding="async"
          />

        </a>
        <div className="min-w-0 flex-1 overflow-x-auto scrollbar-hide md:flex md:justify-center">
          <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-background p-1 shadow-lg">
            {PREVIEW_SHAPE_TOOLS.map(({ id, label, Icon }) => (
              <PreviewToolButton key={id} label={label} onClick={handlePreviewToolClick}>
                <Icon className="size-5" />
              </PreviewToolButton>
            ))}
            <PreviewToolButton label="Color" onClick={handlePreviewToolClick}>
              <span
                className="size-5 rounded-full border border-border"
                style={{ backgroundColor: "#ef4444" }}
              />
            </PreviewToolButton>
            <PreviewDivider />
            <PreviewToolButton label="Undo" onClick={handlePreviewToolClick}>
              <Undo2 className="size-5" />
            </PreviewToolButton>
            <PreviewToolButton label="Redo" onClick={handlePreviewToolClick}>
              <Redo2 className="size-5" />
            </PreviewToolButton>
            <PreviewDivider />
            {PREVIEW_ACTION_TOOLS.map(({ id, label, Icon }) => (
              <PreviewToolButton key={id} label={label} onClick={handlePreviewToolClick}>
                <Icon className="size-5" />
              </PreviewToolButton>
            ))}
          </div>
        </div>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <span title="Cancel upload">
            <Button variant="outline" size="lg" disabled aria-label="Cancel upload">
              <X className="size-4" />
              Cancel
            </Button>
          </span>

          <span title="Save image">
            <Button variant="outline" size="lg" disabled aria-label="Save" className="cursor-not-allowed">
              <Download className="size-4" />
              Save
            </Button>
          </span>
        </div>
      </div>
      <Toaster />

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-3 py-6 sm:px-4 sm:py-10">
        <div
          className={cn(
            "w-full max-w-3xl rounded-2xl border-2 border-dashed bg-card transition-colors sm:rounded-3xl",
            isDragging ? "border-primary bg-primary/5" : "border-border",
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            pickFiles(e.dataTransfer.files);
          }}
        >
          <div className="flex flex-col items-center gap-5 px-4 py-10 text-center sm:gap-6 sm:px-6 sm:py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground sm:h-20 sm:w-20">
              <Upload className="size-7 sm:size-9" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Edit Text on Screenshot
              </h1>
              <p className="text-muted-foreground">
                Edit and Annotate Text on Screenshots Effortlessly Online
              </p>
            </div>

            <div className="relative inline-flex">
              <Button
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-r-none px-6 transition-all duration-200 hover:bg-primary/80 "
              >
                Choose a file
              </Button>
              <Button
                size="lg"
                className="rounded-l-none border-l border-primary-foreground/30 px-2 transition-all duration-200 hover:bg-primary/80 hover:shadow-md"
                onClick={() => setShowMenu((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={showMenu}
                aria-label="More upload options"
              >
                <ChevronDown className="size-4" aria-hidden="true" />
              </Button>
              {showMenu && (
                <div
                  role="menu"
                  className="absolute top-full left-0 right-0 z-10 mt-2 overflow-hidden rounded-xl border border-border bg-card text-left shadow-lg"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setShowMenu(false);
                      fileInputRef.current?.click();
                    }}
                  >
                    <Upload className="size-4" />
                    From device
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                    onClick={() => {
                      setShowMenu(false);
                      setShowUrlDialog(true);
                    }}
                  >
                    <LinkIcon className="size-4" />
                    From URL
                  </button>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground">
              or drag and drop a file
            </p>
            <p className="text-xs text-muted-foreground">
              Supports PNG, JPG, GIF, WebP image formats
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => pickFiles(e.target.files)}
        />

        {fileError && (
          <p className="text-sm text-destructive mt-3">{fileError}</p>
        )}
        {urlError && (
          <p className="text-sm text-destructive mt-3">{urlError}</p>
        )}

        {/* Marketing landing — shown ONLY on the upload screen (this whole
            component unmounts once an image is loaded). */}
        <div className="mt-12 w-full">
          <LandingContent onChooseFile={() => fileInputRef.current?.click()} />
        </div>

        {/* URL Dialog */}
        <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Load image from URL</DialogTitle>
              <DialogDescription>
                Paste a direct link to a PNG, JPG, GIF, or WebP image.
              </DialogDescription>
            </DialogHeader>

            <Input
              placeholder="https://example.com/image.png"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUrlSubmit();
              }}
              autoFocus
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUrlDialog(false);
                  setUrlInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim() || loading}
                className="ml-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90  disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Spinner />
                    Loading…
                  </>
                ) : (
                  "Load image"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function PreviewToolButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
    >
      {children}
      <span>{label}</span>
    </button>
  );
}

function PreviewDivider() {
  return <span className="mx-1 h-12 w-px bg-border" aria-hidden />;
}