"use client";

import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { SuiGrpcClient } from "@mysten/sui/grpc";
import type { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DEFAULT_NETWORK, NETWORKS, type WalrusNetwork } from "@/lib/constants";

const grpcNetworkClients = {
  testnet: new SuiGrpcClient({
    network: "testnet",
    baseUrl: NETWORKS.testnet.grpcUrl
  }),
  mainnet: new SuiGrpcClient({
    network: "mainnet",
    baseUrl: NETWORKS.mainnet.grpcUrl
  })
};

// dApp Kit's legacy provider type is JSON-RPC-shaped, but its client factory can
// host the gRPC clients used by the wallet hooks and transaction serializer.
const networkConfig = grpcNetworkClients as unknown as Record<WalrusNetwork, SuiJsonRpcClient>;

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [activeNetwork, setActiveNetwork] = useState<WalrusNetwork>(DEFAULT_NETWORK);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        createClient={(_network, client) => client}
        network={activeNetwork}
        onNetworkChange={(network) => setActiveNetwork(network as WalrusNetwork)}
      >
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
