"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, ImageIcon, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ACCEPTED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import type { UploadPhase } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

type UploadDropzoneProps = {
  selectedFile: File | null;
  previewUrl?: string;
  phase: UploadPhase;
  progress: number;
  statusText: string;
  onSelectFile: (file: File) => void;
  onClear: () => void;
  onUpload: () => void;
};

export function UploadDropzone({
  selectedFile,
  previewUrl,
  phase,
  progress,
  statusText,
  onSelectFile,
  onClear,
  onUpload
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isBusy = ["encoding", "registering", "uploading", "certifying"].includes(phase);

  function pickFile(file?: File) {
    if (!file) return;
    onSelectFile(file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    pickFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    pickFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section className="min-h-[560px] rounded-lg border border-white/10 bg-card/75 p-4 shadow-glow sm:p-6">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleInput}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-background/70 p-6 text-center transition",
          isDragging && "border-primary bg-primary/10",
          selectedFile && "items-stretch justify-start text-left"
        )}
      >
        {selectedFile ? (
          <div className="grid gap-4 md:grid-cols-[220px_1fr]">
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-white/10 bg-muted">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt={selectedFile.name} className="h-full w-full object-cover" />
              ) : (
                <FileUp className="h-14 w-14 text-muted-foreground" />
              )}
            </div>
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold">{selectedFile.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedFile.type || "application/octet-stream"} · {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClear();
                    }}
                    disabled={isBusy}
                    aria-label="Clear selected file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Stored through the selected Walrus Upload Relay. Wallet signing is required for
                  registration and certification.
                </p>
              </div>

              <div className="space-y-3">
                {phase !== "idle" ? (
                  <div className="space-y-2">
                    <Progress value={progress} />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{statusText}</span>
                      <span>{progress}%</span>
                    </div>
                  </div>
                ) : null}
                <Button
                  type="button"
                  className="w-full sm:w-auto"
                  disabled={isBusy}
                  onClick={(event) => {
                    event.stopPropagation();
                    onUpload();
                  }}
                >
                  {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Upload to Walrus
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-md space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md bg-secondary text-primary">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Drop a file here</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Images, PDFs, videos, text, JSON, and ZIP files are supported up to{" "}
                {formatBytes(MAX_FILE_SIZE)}.
              </p>
            </div>
            <Button type="button" variant="secondary">
              <UploadCloud className="h-4 w-4" />
              Choose File
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
