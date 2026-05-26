"use client";

import { CheckCircle2, Copy, ExternalLink, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { UploadRecord } from "@/lib/types";
import { formatBytes } from "@/lib/utils";

type UploadResultProps = {
  record: UploadRecord | null;
  onCopy: (value: string) => void;
};

export function UploadResult({ record, onCopy }: UploadResultProps) {
  if (!record) return null;

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
          <span>Epochs: {record.proof.epochs}</span>
          <span>Relay: {record.proof.relayHost}</span>
        </div>
        <Badge variant="outline" className="mt-3">
          {record.proof.deletable ? "Deletable blob" : "Permanent blob"}
        </Badge>
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
