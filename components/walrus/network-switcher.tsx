"use client";

import { useSuiClientContext } from "@mysten/dapp-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NETWORKS, type WalrusNetwork } from "@/lib/constants";

export function NetworkSwitcher() {
  const context = useSuiClientContext();
  const activeNetwork = context.network as WalrusNetwork;

  return (
    <Select
      value={activeNetwork}
      onValueChange={(value) => context.selectNetwork(value as WalrusNetwork)}
    >
      <SelectTrigger className="w-[132px] bg-card/80">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(NETWORKS) as WalrusNetwork[]).map((network) => (
          <SelectItem key={network} value={network}>
            {NETWORKS[network].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
