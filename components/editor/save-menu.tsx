"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  onSave: (options: { filename?: string }) => void;
  filename?: string;
};

export function SaveMenu({ onSave, filename = "" }: Props) {
  const handleDownload = () => {
    onSave({ filename: filename || "untitled" });
  };

  return (
    <Button
      onClick={handleDownload}
      className="px-4 transition-colors hover:bg-primary/80"
    >
      <Download className="size-4" />
      Download
    </Button>
  );
}
