"use client";

import type { Transaction } from "@mysten/sui/transactions";
import {
  DEFAULT_EPOCHS,
  NETWORKS,
  WALRUS_RELAY_TIP_MAX,
  type WalrusNetwork
} from "@/lib/constants";

export type SignAndExecute = (input: { transaction: Transaction }) => Promise<unknown>;

const WALRUS_WASM_CDN =
  "https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm";

export function createWalrusClient(network: WalrusNetwork) {
  const config = NETWORKS[network];

  return Promise.all([import("@mysten/sui/grpc"), import("@mysten/walrus")]).then(
    ([{ SuiGrpcClient }, { walrus }]) =>
      new SuiGrpcClient({
        network,
        baseUrl: config.fullnodeUrl
      }).$extend(
        walrus({
          wasmUrl: WALRUS_WASM_CDN,
          uploadRelay: {
            host: config.uploadRelayUrl,
            sendTip: {
              max: WALRUS_RELAY_TIP_MAX
            }
          },
          storageNodeClientOptions: {
            timeout: 60_000
          }
        })
      )
  );
}

export function buildWalrusUrls(blobId: string, network: WalrusNetwork) {
  const config = NETWORKS[network];

  return {
    shareUrl: `${config.directWalAppBase}/${blobId}`,
    aggregatorUrl: `${config.aggregatorUrl}/v1/blobs/${blobId}`
  };
}

function extractTransactionDigest(result: unknown) {
  if (!result || typeof result !== "object") return undefined;

  const record = result as Record<string, unknown>;
  const transaction = record.Transaction;
  if (transaction && typeof transaction === "object") {
    const digest = (transaction as Record<string, unknown>).digest;
    if (typeof digest === "string") return digest;
  }

  return typeof record.digest === "string" ? record.digest : undefined;
}

function assertWalletResult(result: unknown, label: string) {
  if (!result || typeof result !== "object") return;

  const record = result as Record<string, unknown>;
  if (record.$kind !== "FailedTransaction") return;

  const failed = record.FailedTransaction as
    | { status?: { error?: { message?: string } } }
    | undefined;
  throw new Error(`${label} failed: ${failed?.status?.error?.message ?? "wallet rejected transaction"}`);
}

export async function uploadFileToWalrus({
  file,
  address,
  network,
  signAndExecute,
  onProgress
}: {
  file: File;
  address: string;
  network: WalrusNetwork;
  signAndExecute: SignAndExecute;
  onProgress: (progress: number, message: string) => void;
}) {
  const [{ WalrusFile }, client] = await Promise.all([
    import("@mysten/walrus"),
    createWalrusClient(network)
  ]);
  const config = NETWORKS[network];
  const bytes = new Uint8Array(await file.arrayBuffer());

  const flow = client.walrus.writeFilesFlow({
    files: [
      WalrusFile.from({
        contents: bytes,
        identifier: file.name,
        tags: {
          "content-type": file.type || "application/octet-stream"
        }
      })
    ]
  });

  onProgress(15, "Encoding file for Walrus...");
  const encoded = await flow.encode();
  const encodedBlobId =
    typeof encoded === "object" && encoded && "blobId" in encoded
      ? String((encoded as { blobId: string }).blobId)
      : undefined;

  onProgress(35, "Registering storage on Sui...");
  const registerTx = flow.register({
    epochs: DEFAULT_EPOCHS,
    owner: address,
    deletable: true
  });
  const registerResult = await signAndExecute({ transaction: registerTx });
  assertWalletResult(registerResult, "Registration");

  const registerDigest = extractTransactionDigest(registerResult);
  if (!registerDigest) {
    throw new Error("Wallet did not return a registration transaction digest.");
  }

  onProgress(62, "Uploading through Walrus relay...");
  await flow.upload({ digest: registerDigest });

  onProgress(84, "Certifying blob availability...");
  const certifyTx = flow.certify();
  const certifyResult = await signAndExecute({ transaction: certifyTx });
  assertWalletResult(certifyResult, "Certification");

  const certifyDigest = extractTransactionDigest(certifyResult);
  const files = await flow.listFiles();
  const firstFile = files[0] as
    | {
        blobId?: string;
        id?: string;
        blobObject?: {
          id?: string;
          storage?: {
            start_epoch?: number;
            end_epoch?: number;
            storage_size?: string;
          };
        };
      }
    | undefined;
  const blobId = firstFile?.blobId ?? encodedBlobId;

  if (!blobId) {
    throw new Error("Upload completed, but Walrus did not return a blob ID.");
  }

  onProgress(100, "Upload complete.");

  return {
    blobId,
    blobObjectId: firstFile?.blobObject?.id,
    quiltId: firstFile?.id,
    registerDigest,
    certifyDigest,
    storage: firstFile?.blobObject?.storage,
    relayHost: config.uploadRelayUrl,
    ...buildWalrusUrls(blobId, network)
  };
}

export async function extendWalrusBlobStorage({
  blobObjectId,
  network,
  epochs,
  signAndExecute
}: {
  blobObjectId: string;
  network: WalrusNetwork;
  epochs: number;
  signAndExecute: SignAndExecute;
}) {
  const client = await createWalrusClient(network);
  const tx = await client.walrus.extendBlobTransaction({
    blobObjectId,
    epochs
  });

  const result = await signAndExecute({ transaction: tx });
  assertWalletResult(result, "Storage extension");

  const digest = extractTransactionDigest(result);
  if (!digest) {
    throw new Error("Wallet did not return an extension transaction digest.");
  }

  const blobObject = await client.walrus.getBlobObject(blobObjectId);

  return {
    digest,
    storage: blobObject.storage
  };
}
