import { ApiError } from "@/api/http";
import { buildWonApiUrl } from "@/lib/won-api-base";

type JsonRecord = Record<string, unknown>;

export interface WonBootstrapResponse {
  ok: true;
  created: boolean;
  linked: boolean;
  securityToken?: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    profileImageUri?: string | null;
    onboardingComplete: boolean;
  };
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

export async function bootstrapWonApiUser(accessToken: string, input?: {
  name?: string | null;
}) {
  const response = await fetch(buildWonApiUrl("/api/auth/bootstrap"), {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(
      input?.name
        ? { name: input.name }
        : {}
    ),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const data = asRecord(payload);

  if (!response.ok) {
    const code = typeof data?.error === "string" ? data.error : undefined;
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `HTTP ${response.status}`;

    throw new ApiError(message, response.status, code, data);
  }

  return payload as WonBootstrapResponse;
}
