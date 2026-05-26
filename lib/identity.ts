import type { WalrusNetwork } from "@/lib/constants";

export const DEVELOPER_WALLET =
  process.env.NEXT_PUBLIC_DEVELOPER_WALLET ??
  "0xbbc8f3deb39954974cd4556cd81579429ceb32d7a01d66570ce3d3d542c37b69";

export const PROJECT_WEBSITE = process.env.NEXT_PUBLIC_PROJECT_WEBSITE ?? "TBD";
export const PROJECT_GITHUB = process.env.NEXT_PUBLIC_PROJECT_GITHUB ?? "TBD";
export const DEVELOPER_SUINS = process.env.NEXT_PUBLIC_DEVELOPER_SUINS ?? "TBD";
export const SUI_EXPLORER_BASE =
  process.env.NEXT_PUBLIC_SUI_EXPLORER_BASE ?? "https://suiexplorer.com";

export const REGISTRY_IDS: Record<
  WalrusNetwork,
  {
    packageId?: string;
    appProfileId?: string;
    adminCapId?: string;
  }
> = {
  testnet: {
    packageId: process.env.NEXT_PUBLIC_TESTNET_REGISTRY_PACKAGE_ID,
    appProfileId: process.env.NEXT_PUBLIC_TESTNET_APP_PROFILE_ID,
    adminCapId: process.env.NEXT_PUBLIC_TESTNET_ADMIN_CAP_ID
  },
  mainnet: {
    packageId: process.env.NEXT_PUBLIC_MAINNET_REGISTRY_PACKAGE_ID,
    appProfileId: process.env.NEXT_PUBLIC_MAINNET_APP_PROFILE_ID,
    adminCapId: process.env.NEXT_PUBLIC_MAINNET_ADMIN_CAP_ID
  }
};

export function isConfigured(value?: string) {
  return Boolean(value && value.trim() && value !== "TBD");
}

export function explorerUrl({
  type,
  id,
  network
}: {
  type: "address" | "object";
  id: string;
  network: WalrusNetwork;
}) {
  const query = network === "mainnet" ? "" : `?network=${network}`;
  return `${SUI_EXPLORER_BASE}/${type}/${id}${query}`;
}
