"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  Loader2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CANONICAL_AGGREGATOR_BASE } from "@/lib/constants";
import type { UploadRecord } from "@/lib/types";
import { formatBytes, getErrorMessage } from "@/lib/utils";

type UploadResultProps = {
  record: UploadRecord | null;
  onCopy: (value: string) => void;
  onExtend: (record: UploadRecord, epochs: number) => void;
  extendEpochs: number;
  onExtendEpochsChange: (epochs: number) => void;
  isExtending: boolean;
};

export function UploadResult({
  record,
  onCopy,
  onExtend,
  extendEpochs,
  onExtendEpochsChange,
  isExtending
}: UploadResultProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  if (!record) return null;

  const currentRecord = record;

  const downloadUrl = `${CANONICAL_AGGREGATOR_BASE[currentRecord.network]}/v1/blobs/${currentRecord.blobId}`;

  async function handleDownload() {
    try {
      setIsDownloading(true);
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}.`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = currentRecord.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      window.alert(getErrorMessage(error));
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="rounded-lg border border-primary/30 bg-primary/10 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Uploaded successfully</h2>
          <p className="text-sm text-muted-foreground">
            {record.fileName} · {formatBytes(record.fileSize)}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        <Button type="button" onClick={handleDownload} disabled={isDownloading}>
          {isDownloading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Download
        </Button>
        <Button variant="outline" asChild>
          <a href={downloadUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open Raw
          </a>
        </Button>
        <Button variant="secondary" onClick={() => onCopy(record.shareUrl)}>
          <Copy className="h-4 w-4" />
          Copy Share Link
        </Button>
      </div>

      <div className="space-y-3">
        <InfoRow label="Blob ID" value={record.blobId} onCopy={onCopy} />
        <InfoRow label="Share Link" value={record.shareUrl} href={record.shareUrl} onCopy={onCopy} />
        <InfoRow
          label="Aggregator"
          value={record.aggregatorUrl}
          href={record.aggregatorUrl}
          onCopy={onCopy}
        />
      </div>

      {record.previewUrl ? (
        <div className="mt-5 overflow-hidden rounded-md border border-white/10 bg-background">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.previewUrl} alt={record.fileName} className="max-h-[360px] w-full object-contain" />
        </div>
      ) : null}

      <div className="mt-5 rounded-md border border-white/10 bg-background/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <FileCheck2 className="h-4 w-4 text-primary" />
          Storage Proof
        </div>
        <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <span>Register TX: {record.proof.registerDigest ?? "N/A"}</span>
          <span>Certify TX: {record.proof.certifyDigest ?? "N/A"}</span>
          <span>Initial epochs: {record.proof.epochs}</span>
          <span>Extended epochs: {record.proof.extendedByEpochs ?? 0}</span>
          <span>End epoch: {record.proof.endEpoch ?? "N/A"}</span>
          <span>Blob object: {record.blobObjectId ?? "N/A"}</span>
          <span>Relay: {record.proof.relayHost}</span>
          <span>Last extend TX: {record.proof.extendDigest ?? "N/A"}</span>
        </div>
        <Badge variant="outline" className="mt-3">
          {record.proof.deletable ? "Deletable blob" : "Permanent blob"}
        </Badge>
      </div>

      <div className="mt-5 rounded-md border border-white/10 bg-background/70 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <RefreshCw className="h-4 w-4 text-primary" />
          Extend Storage
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid gap-1 text-sm">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Additional epochs</span>
            <input
              type="number"
              min={1}
              max={365}
              value={extendEpochs}
              onChange={(event) => onExtendEpochsChange(Number(event.target.value))}
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring sm:w-44"
            />
          </label>
          <Button
            type="button"
            disabled={isExtending || !record.blobObjectId}
            onClick={() => onExtend(record, extendEpochs)}
            className="sm:mb-0"
          >
            {isExtending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Extend
          </Button>
        </div>
        {!record.blobObjectId ? (
          <p className="mt-3 text-xs text-muted-foreground">
            This older local record does not include a Walrus blob object ID, so it cannot be
            extended from history.
          </p>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Extending requires wallet approval and consumes WAL for the additional storage period.
          </p>
        )}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
  href,
  onCopy
}: {
  label: string;
  value: string;
  href?: string;
  onCopy: (value: string) => void;
}) {
  return (
    <div className="rounded-md border border-white/10 bg-background/70 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-sm">{value}</code>
        {href ? (
          <Button size="icon" variant="ghost" asChild aria-label={`Open ${label}`}>
            <a href={href} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
        <Button size="icon" variant="ghost" onClick={() => onCopy(value)} aria-label={`Copy ${label}`}>
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
