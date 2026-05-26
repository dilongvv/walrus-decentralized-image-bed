"use client";

import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClientContext
} from "@mysten/dapp-kit";
import { Header } from "@/components/walrus/header";
import { HistoryList } from "@/components/walrus/history-list";
import { StatusMessage } from "@/components/walrus/status-message";
import { UploadDropzone } from "@/components/walrus/upload-dropzone";
import { UploadResult } from "@/components/walrus/upload-result";
import { VerifiedDeveloper } from "@/components/walrus/verified-developer";
import {
  ACCEPTED_MIME_TYPES,
  DEFAULT_EPOCHS,
  MAX_FILE_SIZE,
  NETWORKS,
  type WalrusNetwork
} from "@/lib/constants";
import { readUploadHistory, saveUploadRecord, updateUploadRecord } from "@/lib/history";
import type { UploadPhase, UploadRecord } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { extendWalrusBlobStorage, uploadFileToWalrus } from "@/lib/walrus";

export function WalrusImageBed() {
  const account = useCurrentAccount();
  const suiContext = useSuiClientContext();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const network = suiContext.network as WalrusNetwork;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string>();
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<UploadRecord | null>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [extendEpochs, setExtendEpochs] = useState(DEFAULT_EPOCHS);
  const [isExtending, setIsExtending] = useState(false);

  const isSelectedImage = useMemo(
    () => Boolean(selectedFile?.type.startsWith("image/")),
    [selectedFile]
  );

  useEffect(() => {
    setRecords(readUploadHistory());
    setIsHistoryLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  function selectFile(file: File) {
    setError(null);
    setNotice(null);
    setPhase("idle");
    setProgress(0);
    setStatusText("Ready");
    setActiveRecord(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("This file is larger than 100MB. Please choose a smaller file.");
      return;
    }

    if (file.type && !ACCEPTED_MIME_TYPES.includes(file.type)) {
      setError("Unsupported file type. Please upload an image, PDF, video, text, JSON, or ZIP file.");
      return;
    }

    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setSelectedFile(file);
    setLocalPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined);
  }

  function clearFile() {
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setSelectedFile(null);
    setLocalPreviewUrl(undefined);
    setPhase("idle");
    setProgress(0);
    setStatusText("Ready");
    setError(null);
  }

  async function copyToClipboard(value: string) {
    await navigator.clipboard.writeText(value);
    setNotice("Copied to clipboard.");
    window.setTimeout(() => setNotice(null), 2200);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("Choose a file before uploading.");
      return;
    }

    if (!account?.address) {
      setError("Connect your Sui wallet first. The upload needs wallet signatures.");
      return;
    }

    try {
      setError(null);
      setNotice(null);
      setPhase("encoding");
      setProgress(5);
      setStatusText("Preparing upload...");

      const uploaded = await uploadFileToWalrus({
        file: selectedFile,
        address: account.address,
        network,
        signAndExecute: signAndExecuteTransaction,
        onProgress: (nextProgress, message) => {
          setProgress(nextProgress);
          setStatusText(message);
          if (nextProgress < 30) setPhase("encoding");
          else if (nextProgress < 55) setPhase("registering");
          else if (nextProgress < 80) setPhase("uploading");
          else if (nextProgress < 100) setPhase("certifying");
        }
      });

      const record: UploadRecord = {
        id: crypto.randomUUID(),
        blobId: uploaded.blobId,
        blobObjectId: uploaded.blobObjectId,
        quiltId: uploaded.quiltId,
        fileName: selectedFile.name,
        fileType: selectedFile.type || "application/octet-stream",
        fileSize: selectedFile.size,
        uploadedAt: new Date().toISOString(),
        network,
        shareUrl: uploaded.shareUrl,
        aggregatorUrl: uploaded.aggregatorUrl,
        previewUrl: isSelectedImage ? uploaded.aggregatorUrl : undefined,
        proof: {
          registerDigest: uploaded.registerDigest,
          certifyDigest: uploaded.certifyDigest,
          epochs: DEFAULT_EPOCHS,
          startEpoch: uploaded.storage?.start_epoch,
          endEpoch: uploaded.storage?.end_epoch,
          storageSize: uploaded.storage?.storage_size,
          deletable: true,
          relayHost: uploaded.relayHost
        }
      };

      setPhase("complete");
      setProgress(100);
      setStatusText("Complete");
      setActiveRecord(record);
      setRecords(saveUploadRecord(record));
      setNotice("Your file is stored on Walrus and ready to share.");
      confetti({
        particleCount: 120,
        spread: 72,
        origin: { y: 0.72 },
        colors: ["#2dd4bf", "#a78bfa", "#f8fafc"]
      });
    } catch (err) {
      setPhase("error");
      setError(getErrorMessage(err));
      setStatusText("Upload failed");
    }
  }

  async function handleExtendStorage(record: UploadRecord, epochs: number) {
    if (!account?.address) {
      setError("Connect your Sui wallet first. Extending storage needs a wallet signature.");
      return;
    }

    if (record.network !== network) {
      setError(`Switch to ${NETWORKS[record.network].label} before extending this upload.`);
      return;
    }

    if (!record.blobObjectId) {
      setError("This upload record does not include a Walrus blob object ID, so it cannot be extended.");
      return;
    }

    if (!Number.isFinite(epochs) || epochs < 1) {
      setError("Enter at least 1 epoch to extend storage.");
      return;
    }

    try {
      setIsExtending(true);
      setError(null);
      setNotice(null);

      const extended = await extendWalrusBlobStorage({
        blobObjectId: record.blobObjectId,
        network,
        epochs,
        signAndExecute: signAndExecuteTransaction
      });

      const nextRecord: UploadRecord = {
        ...record,
        proof: {
          ...record.proof,
          extendDigest: extended.digest,
          extendedByEpochs: (record.proof.extendedByEpochs ?? 0) + epochs,
          startEpoch: extended.storage.start_epoch,
          endEpoch: extended.storage.end_epoch,
          storageSize: extended.storage.storage_size
        }
      };

      setActiveRecord(nextRecord);
      setRecords(updateUploadRecord(nextRecord));
      setNotice(`Storage extended by ${epochs} epoch${epochs === 1 ? "" : "s"}.`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsExtending(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-6 sm:py-8">
        <div className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">Walrus Upload Relay</p>
            <h2 className="max-w-3xl text-3xl font-semibold tracking-normal sm:text-4xl">
              Store images and files on decentralized Walrus storage.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Active network: {NETWORKS[network].label}. Relay: {NETWORKS[network].uploadRelayUrl}
            </p>
          </div>
        </div>

        <div className="mb-5">
          <VerifiedDeveloper network={network} />
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {error ? <StatusMessage type="error" message={error} /> : null}
            {notice ? <StatusMessage type="success" message={notice} /> : null}
            <UploadDropzone
              selectedFile={selectedFile}
              previewUrl={localPreviewUrl}
              phase={phase}
              progress={progress}
              statusText={statusText}
              onSelectFile={selectFile}
              onClear={clearFile}
              onUpload={handleUpload}
            />
            <UploadResult
              record={activeRecord}
              onCopy={copyToClipboard}
              onExtend={handleExtendStorage}
              extendEpochs={extendEpochs}
              onExtendEpochsChange={(epochs) => setExtendEpochs(Math.max(1, Math.floor(epochs || 1)))}
              isExtending={isExtending}
            />
          </div>

          <HistoryList
            records={records}
            isLoading={isHistoryLoading}
            onSelect={(record) => {
              setActiveRecord(record);
              setNotice("Loaded upload record from local history.");
              setError(null);
            }}
          />
        </div>
      </main>
    </div>
  );
}
