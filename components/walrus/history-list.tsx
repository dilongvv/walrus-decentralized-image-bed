"use client";

import { Clock3, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UploadRecord } from "@/lib/types";
import { buildWalrusFileUrls } from "@/lib/walrus";
import { formatBytes } from "@/lib/utils";

type HistoryListProps = {
  records: UploadRecord[];
  isLoading: boolean;
  onSelect: (record: UploadRecord) => void;
};

export function HistoryList({ records, isLoading, onSelect }: HistoryListProps) {
  return (
    <aside className="rounded-lg border border-white/10 bg-card/75 p-4 shadow-glow sm:p-5 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent uploads</h2>
          <p className="text-sm text-muted-foreground">Saved locally, latest 20</p>
        </div>
        <Clock3 className="h-5 w-5 text-muted-foreground" />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-md border border-dashed border-white/15 p-6 text-center text-sm text-muted-foreground">
          Upload history will appear here after your first successful file.
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const resolvedUrls = buildWalrusFileUrls({
              network: record.network,
              resourceId: record.quiltId ?? record.blobId,
              isQuiltPatch: Boolean(record.quiltId),
              identifier: record.fileName
            });

            return (
              <button
                key={record.id}
                type="button"
                className="w-full rounded-md border border-white/10 bg-background/65 p-3 text-left transition hover:border-primary/50 hover:bg-background"
                onClick={() => onSelect(record)}
              >
                <div className="flex gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {record.fileType.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolvedUrls.aggregatorUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{record.fileName}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatBytes(record.fileSize)} · {new Date(record.uploadedAt).toLocaleString()}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{record.network}</Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        asChild
                        onClick={(event) => event.stopPropagation()}
                        aria-label="Open share link"
                      >
                        <a href={resolvedUrls.shareUrl} target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
}
