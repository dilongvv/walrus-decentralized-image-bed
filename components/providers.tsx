"use client";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { DEFAULT_NETWORK, NETWORKS, type WalrusNetwork } from "@/lib/constants";

const { networkConfig } = createNetworkConfig({
  testnet: {
    network: "testnet",
    url: NETWORKS.testnet.fullnodeUrl
  },
  mainnet: {
    network: "mainnet",
    url: NETWORKS.mainnet.fullnodeUrl
  }
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [activeNetwork, setActiveNetwork] = useState<WalrusNetwork>(DEFAULT_NETWORK);

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        network={activeNetwork}
        onNetworkChange={(network) => setActiveNetwork(network as WalrusNetwork)}
      >
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
