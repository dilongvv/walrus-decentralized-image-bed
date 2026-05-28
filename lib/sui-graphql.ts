import { NETWORKS, type WalrusNetwork } from "@/lib/constants";

export type AppProfileFields = {
  developer?: string;
  website_url?: string;
  github_url?: string;
  suins_name?: string;
  app_version?: string;
};

type GraphQLError = {
  message?: string;
};

type GraphQLResponse<T> = {
  data?: T;
  errors?: GraphQLError[];
};

type AppProfileQueryData = {
  object?: {
    asMoveObject?: {
      contents?: {
        json?: unknown;
      };
    };
  };
};

const APP_PROFILE_QUERY = `
query AppProfile($address: SuiAddress!) {
  object(address: $address) {
    asMoveObject {
      contents {
        json
      }
    }
  }
}
`;

export async function getAppProfile({
  network,
  objectId
}: {
  network: WalrusNetwork;
  objectId: string;
}) {
  const data = await suiGraphqlRequest<AppProfileQueryData>({
    network,
    query: APP_PROFILE_QUERY,
    variables: {
      address: objectId
    }
  });

  return extractAppProfileFields(data.object?.asMoveObject?.contents?.json);
}

async function suiGraphqlRequest<T>({
  network,
  query,
  variables
}: {
  network: WalrusNetwork;
  query: string;
  variables?: Record<string, unknown>;
}) {
  const response = await fetch(NETWORKS[network].graphqlUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!response.ok) {
    throw new Error(`Sui GraphQL request failed with HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(
      payload.errors.map((error) => error.message).filter(Boolean).join("; ") ||
        "Sui GraphQL returned an error"
    );
  }

  if (!payload.data) {
    throw new Error("Sui GraphQL response did not include data");
  }

  return payload.data;
}

function extractAppProfileFields(json: unknown): AppProfileFields | null {
  if (!json || typeof json !== "object") return null;

  const fields = json as Record<string, unknown>;

  return {
    developer: readNonEmptyString(fields.developer),
    website_url: readNonEmptyString(fields.website_url),
    github_url: readNonEmptyString(fields.github_url),
    suins_name: readNonEmptyString(fields.suins_name),
    app_version: readNonEmptyString(fields.app_version)
  };
}

function readNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}
