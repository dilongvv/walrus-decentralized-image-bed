export type WalrusNetwork = "testnet" | "mainnet";

export const CANONICAL_AGGREGATOR_BASE: Record<WalrusNetwork, string> = {
  testnet: "https://aggregator.walrus-testnet.walrus.space",
  mainnet: "https://aggregator.walrus-mainnet.walrus.space"
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024;

export const ACCEPTED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "text/plain",
  "application/json",
  "application/zip"
];

export const NETWORKS: Record<
  WalrusNetwork,
  {
    label: string;
    fullnodeUrl: string;
    graphqlUrl: string;
    grpcUrl: string;
    uploadRelayUrl: string;
    aggregatorUrl: string;
    directWalAppBase: string;
  }
> = {
  testnet: {
    label: "Testnet",
    fullnodeUrl:
      process.env.NEXT_PUBLIC_TESTNET_FULLNODE ?? "https://fullnode.testnet.sui.io:443",
    graphqlUrl:
      process.env.NEXT_PUBLIC_TESTNET_GRAPHQL ?? "https://graphql.testnet.sui.io/graphql",
    grpcUrl:
      process.env.NEXT_PUBLIC_TESTNET_GRPC ??
      process.env.NEXT_PUBLIC_TESTNET_FULLNODE ??
      "https://fullnode.testnet.sui.io:443",
    uploadRelayUrl:
      process.env.NEXT_PUBLIC_TESTNET_UPLOAD_RELAY ??
      "https://upload-relay.testnet.walrus.space",
    aggregatorUrl:
      process.env.NEXT_PUBLIC_TESTNET_AGGREGATOR ?? CANONICAL_AGGREGATOR_BASE.testnet,
    directWalAppBase: "https://wal.app"
  },
  mainnet: {
    label: "Mainnet",
    fullnodeUrl:
      process.env.NEXT_PUBLIC_MAINNET_FULLNODE ?? "https://fullnode.mainnet.sui.io:443",
    graphqlUrl:
      process.env.NEXT_PUBLIC_MAINNET_GRAPHQL ?? "https://graphql.mainnet.sui.io/graphql",
    grpcUrl:
      process.env.NEXT_PUBLIC_MAINNET_GRPC ??
      process.env.NEXT_PUBLIC_MAINNET_FULLNODE ??
      "https://fullnode.mainnet.sui.io:443",
    uploadRelayUrl:
      process.env.NEXT_PUBLIC_MAINNET_UPLOAD_RELAY ??
      "https://upload-relay.mainnet.walrus.space",
    aggregatorUrl:
      process.env.NEXT_PUBLIC_MAINNET_AGGREGATOR ?? CANONICAL_AGGREGATOR_BASE.mainnet,
    directWalAppBase: "https://wal.app"
  }
};

export const DEFAULT_NETWORK: WalrusNetwork =
  process.env.NEXT_PUBLIC_SUI_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const DEFAULT_EPOCHS = Number(process.env.NEXT_PUBLIC_WALRUS_EPOCHS ?? 3);

export const WALRUS_RELAY_TIP_MAX = Number(
  process.env.NEXT_PUBLIC_WALRUS_RELAY_TIP_MAX ?? 10_000_000
);
