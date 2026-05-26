"use client";

import { useSuiClientQuery } from "@mysten/dapp-kit";
import { CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NETWORKS, type WalrusNetwork } from "@/lib/constants";
import {
  DEVELOPER_SUINS,
  DEVELOPER_WALLET,
  PROJECT_GITHUB,
  PROJECT_WEBSITE,
  REGISTRY_IDS,
  explorerUrl,
  isConfigured
} from "@/lib/identity";
import { shortenAddress } from "@/lib/utils";

export function VerifiedDeveloper({ network }: { network: WalrusNetwork }) {
  const ids = REGISTRY_IDS[network];
  const hasProfile = isConfigured(ids.appProfileId);
  const hasPackage = isConfigured(ids.packageId);

  const profileQuery = useSuiClientQuery(
    "getObject",
    {
      id: ids.appProfileId ?? "",
      options: {
        showContent: true
      }
    },
    {
      enabled: hasProfile && Boolean(ids.appProfileId),
      staleTime: 30_000
    }
  );

  const profileFields = extractProfileFields(profileQuery.data);
  const developerWallet = profileFields?.developer ?? DEVELOPER_WALLET;
  const website = profileFields?.website_url ?? PROJECT_WEBSITE;
  const github = profileFields?.github_url ?? PROJECT_GITHUB;
  const suins = profileFields?.suins_name ?? DEVELOPER_SUINS;

  return (
    <section className="rounded-lg border border-white/10 bg-card/75 p-4 shadow-glow sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Verified Developer</h2>
            <p className="text-sm text-muted-foreground">
              On-chain app identity for {NETWORKS[network].label}.
            </p>
          </div>
        </div>
        <Badge variant={hasProfile && hasPackage ? "default" : "outline"}>
          {hasProfile && hasPackage ? "Registry configured" : "Pending publish"}
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <IdentityRow
          label="Developer wallet"
          value={shortenAddress(developerWallet)}
          href={explorerUrl({ type: "address", id: developerWallet, network })}
        />
        <IdentityRow label="SuiNS" value={suins} />
        <IdentityRow label="Website" value={website} href={website} />
        <IdentityRow label="GitHub" value={github} href={github} />
        <IdentityRow
          label="Registry package"
          value={hasPackage ? shortenAddress(ids.packageId) : "Publish pending"}
          href={
            hasPackage && ids.packageId
              ? explorerUrl({ type: "object", id: ids.packageId, network })
              : undefined
          }
        />
        <IdentityRow
          label="AppProfile object"
          value={hasProfile ? shortenAddress(ids.appProfileId) : "Publish pending"}
          href={
            hasProfile && ids.appProfileId
              ? explorerUrl({ type: "object", id: ids.appProfileId, network })
              : undefined
          }
        />
      </div>

      {profileQuery.isFetching ? (
        <p className="mt-3 text-xs text-muted-foreground">Refreshing on-chain profile data...</p>
      ) : null}

      <div className="mt-4 flex items-start gap-2 rounded-md border border-white/10 bg-background/70 p-3 text-xs leading-5 text-muted-foreground">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <span>
          The Registry Move package must be published by the developer wallet. Explorer
          verification should show the same wallet as publisher, profile developer, and current
          UpgradeCap holder unless the cap is transferred to a disclosed multisig.
        </span>
      </div>
    </section>
  );
}

function extractProfileFields(data: unknown) {
  if (!data || typeof data !== "object") return null;

  const object = data as {
    data?: {
      content?: {
        fields?: Record<string, unknown>;
      };
    };
  };

  const fields = object.data?.content?.fields;
  if (!fields) return null;

  return {
    developer:
      typeof fields.developer === "string" && fields.developer.trim() ? fields.developer : undefined,
    website_url:
      typeof fields.website_url === "string" && fields.website_url.trim()
        ? fields.website_url
        : undefined,
    github_url:
      typeof fields.github_url === "string" && fields.github_url.trim() ? fields.github_url : undefined,
    suins_name:
      typeof fields.suins_name === "string" && fields.suins_name.trim() ? fields.suins_name : undefined
  };
}

function IdentityRow({
  label,
  value,
  href
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const usableHref = href && href !== "TBD" ? href : undefined;

  return (
    <div className="rounded-md border border-white/10 bg-background/70 p-3">
      <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex min-w-0 items-center gap-2">
        <code className="min-w-0 flex-1 truncate text-sm">{value}</code>
        {usableHref ? (
          <Button size="icon" variant="ghost" asChild aria-label={`Open ${label}`}>
            <a href={usableHref} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
