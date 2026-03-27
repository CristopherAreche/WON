import { NextResponse } from "next/server";
import { buildWonApiUrl, getWonApiConfigErrorDetails } from "@/lib/won-api-base";
import { getSupabaseAccessToken } from "@/lib/supabase/server";

type JsonRecord = Record<string, unknown>;

function pickForwardHeaders(source: HeadersInit | undefined) {
  const sourceHeaders = new Headers(source);
  const headers = new Headers();

  for (const name of [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-real-ip",
    "accept-language",
  ]) {
    const value = sourceHeaders.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return headers;
}

async function parseJson(response: Response) {
  return (await response.json().catch(() => null)) as unknown;
}

function unauthorizedResult() {
  return {
    response: new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    }),
    data: { error: "UNAUTHORIZED" } as JsonRecord,
  };
}

export async function requestWonApi(path: string, init: {
  method?: string;
  body?: string;
  headers?: HeadersInit;
  accessToken?: string | null;
  requestUrl?: string;
}) {
  const headers = pickForwardHeaders(init.headers);

  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (init.accessToken) {
    headers.set("authorization", `Bearer ${init.accessToken}`);
  }

  const response = await fetch(buildWonApiUrl(path, init.requestUrl), {
    method: init.method || "GET",
    headers,
    body: init.body,
    cache: "no-store",
  });

  return {
    response,
    data: await parseJson(response),
  };
}

export async function requestWonApiWithSession(path: string, init: {
  method?: string;
  body?: string;
  headers?: HeadersInit;
  requestUrl?: string;
  accessToken?: string | null;
}) {
  const accessToken = init.accessToken ?? (await getSupabaseAccessToken());

  if (!accessToken) {
    return unauthorizedResult();
  }

  return requestWonApi(path, {
    method: init.method,
    body: init.body,
    headers: init.headers,
    requestUrl: init.requestUrl,
    accessToken,
  });
}

export async function proxyWonApiRequest(request: Request, options: {
  path: string;
  method?: string;
  auth?: boolean;
}) {
  const method = options.method || request.method;
  const shouldReadBody = method !== "GET" && method !== "HEAD";
  const body = shouldReadBody ? await request.text() : undefined;

  try {
    const result = options.auth
      ? await requestWonApiWithSession(options.path, {
          method,
          body,
          headers: request.headers,
          requestUrl: request.url,
        })
      : await requestWonApi(options.path, {
          method,
          body,
          headers: request.headers,
          requestUrl: request.url,
        });

    return NextResponse.json(
      result.data ?? (result.response.ok ? { ok: true } : { error: "REQUEST_FAILED" }),
      { status: result.response.status }
    );
  } catch (error) {
    const configError = getWonApiConfigErrorDetails(error);
    if (configError) {
      return NextResponse.json(configError.body, { status: configError.status });
    }

    throw error;
  }
}
