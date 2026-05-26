"use client";

import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { DatabaseZap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NetworkSwitcher } from "@/components/walrus/network-switcher";
import { shortenAddress } from "@/lib/utils";

export function Header() {
  const account = useCurrentAccount();

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="container flex min-h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <DatabaseZap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight sm:text-lg">
              Walrus Decentralized Image Bed
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Decentralized image and file sharing on Sui
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account ? (
            <Badge variant="outline" className="hidden max-w-[150px] sm:inline-flex">
              {shortenAddress(account.address)}
            </Badge>
          ) : null}
          <NetworkSwitcher />
          <ConnectButton connectText="Connect Wallet" />
        </div>
      </div>
    </header>
  );
}
