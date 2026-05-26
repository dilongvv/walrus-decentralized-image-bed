import type { WalrusNetwork } from "@/lib/constants";

export type UploadPhase =
  | "idle"
  | "encoding"
  | "registering"
  | "uploading"
  | "certifying"
  | "complete"
  | "error";

export type UploadRecord = {
  id: string;
  blobId: string;
  blobObjectId?: string;
  quiltId?: string | null;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  network: WalrusNetwork;
  shareUrl: string;
  aggregatorUrl: string;
  previewUrl?: string;
  proof: {
    registerDigest?: string;
    certifyDigest?: string;
    extendDigest?: string;
    epochs: number;
    extendedByEpochs?: number;
    startEpoch?: number;
    endEpoch?: number;
    storageSize?: string;
    deletable: boolean;
    relayHost: string;
  };
};
