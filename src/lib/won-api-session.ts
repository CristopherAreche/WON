import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildWonApiUrl } from "@/lib/won-api-base";
import {
  WON_ACCESS_TOKEN_COOKIE,
  WON_ACCESS_TOKEN_MAX_AGE_SECONDS,
  WON_REFRESH_TOKEN_COOKIE,
  WON_REFRESH_TOKEN_MAX_AGE_SECONDS,
  WON_USER_ID_COOKIE,
} from "@/lib/session-constants";

type JsonRecord = Record<string, unknown>;

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

interface CookieWriter {
  set(
    name: string,
    value: string,
    options?: {
      httpOnly?: boolean;
      sameSite?: "lax" | "strict" | "none";
      secure?: boolean;
      path?: string;
      maxAge?: number;
    }
  ): unknown;
  delete?(name: string): unknown;
}

export interface WonApiSession {
  accessToken: string;
  refreshToken: string;
  userId?: string | null;
}

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" ? (value as JsonRecord) : null;
}

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

function parseSessionPayload(payload: unknown): WonApiSession | null {
  const data = asRecord(payload);
  if (!data) return null;

  const accessToken =
    typeof data.accessToken === "string" ? data.accessToken : "";
  const refreshToken =
    typeof data.refreshToken === "string" ? data.refreshToken : "";
  const userId = typeof data.userId === "string" ? data.userId : null;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    userId,
  };
}

async function requestWonApi(path: string, init: {
  method?: string;
  body?: string;
  headers?: HeadersInit;
  accessToken?: string | null;
}) {
  const headers = pickForwardHeaders(init.headers);

  if (init.body !== undefined && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (init.accessToken) {
    headers.set("authorization", `Bearer ${init.accessToken}`);
  }

  const response = await fetch(buildWonApiUrl(path), {
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

async function refreshWonApiSession(refreshToken: string, headers?: HeadersInit) {
  const { response, data } = await requestWonApi("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
    headers,
  });

  if (!response.ok) {
    return null;
  }

  return parseSessionPayload(data);
}

export function readWonApiSession(store: CookieReader): WonApiSession | null {
  const accessToken = store.get(WON_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(WON_REFRESH_TOKEN_COOKIE)?.value;
  const userId = store.get(WON_USER_ID_COOKIE)?.value || null;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    userId,
  };
}

export function writeWonApiSession(store: CookieWriter, session: WonApiSession) {
  store.set(WON_ACCESS_TOKEN_COOKIE, session.accessToken, {
    ...sessionCookieOptions,
    maxAge: WON_ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  store.set(WON_REFRESH_TOKEN_COOKIE, session.refreshToken, {
    ...sessionCookieOptions,
    maxAge: WON_REFRESH_TOKEN_MAX_AGE_SECONDS,
  });

  if (session.userId) {
    store.set(WON_USER_ID_COOKIE, session.userId, {
      ...sessionCookieOptions,
      maxAge: WON_REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  } else if (typeof store.delete === "function") {
    store.delete(WON_USER_ID_COOKIE);
  } else {
    store.set(WON_USER_ID_COOKIE, "", {
      ...sessionCookieOptions,
      maxAge: 0,
    });
  }
}

export function clearWonApiSession(store: CookieWriter) {
  if (typeof store.delete === "function") {
    store.delete(WON_ACCESS_TOKEN_COOKIE);
    store.delete(WON_REFRESH_TOKEN_COOKIE);
    store.delete(WON_USER_ID_COOKIE);
    return;
  }

  for (const name of [
    WON_ACCESS_TOKEN_COOKIE,
    WON_REFRESH_TOKEN_COOKIE,
    WON_USER_ID_COOKIE,
  ]) {
    store.set(name, "", {
      ...sessionCookieOptions,
      maxAge: 0,
    });
  }
}

export async function getWonApiSessionFromCookies() {
  const cookieStore = await cookies();
  return readWonApiSession(cookieStore);
}

export async function requestWonApiWithSession(path: string, init: {
  method?: string;
  body?: string;
  headers?: HeadersInit;
  session?: WonApiSession | null;
}) {
  const session = init.session ?? null;

  const firstAttempt = await requestWonApi(path, {
    method: init.method,
    body: init.body,
    headers: init.headers,
    accessToken: session?.accessToken,
  });

  if (firstAttempt.response.status !== 401 || !session?.refreshToken) {
    return {
      ...firstAttempt,
      session,
      shouldClearSession: firstAttempt.response.status === 401,
    };
  }

  const refreshedSession = await refreshWonApiSession(
    session.refreshToken,
    init.headers
  );

  if (!refreshedSession) {
    return {
      ...firstAttempt,
      session: null,
      shouldClearSession: true,
    };
  }

  const retryAttempt = await requestWonApi(path, {
    method: init.method,
    body: init.body,
    headers: init.headers,
    accessToken: refreshedSession.accessToken,
  });

  return {
    ...retryAttempt,
    session: retryAttempt.response.status === 401 ? null : refreshedSession,
    shouldClearSession: retryAttempt.response.status === 401,
  };
}

export async function proxyWonApiRequest(request: Request, options: {
  path: string;
  method?: string;
  auth?: boolean;
}) {
  const method = options.method || request.method;
  const shouldReadBody = method !== "GET" && method !== "HEAD";
  const body = shouldReadBody ? await request.text() : undefined;

  if (!options.auth) {
    const { response, data } = await requestWonApi(options.path, {
      method,
      body,
      headers: request.headers,
    });

    return NextResponse.json(
      data ?? (response.ok ? { ok: true } : { error: "REQUEST_FAILED" }),
      { status: response.status }
    );
  }

  const cookieStore = await cookies();
  const currentSession = readWonApiSession(cookieStore);
  const result = await requestWonApiWithSession(options.path, {
    method,
    body,
    headers: request.headers,
    session: currentSession,
  });

  const response = NextResponse.json(
    result.data ?? (result.response.ok ? { ok: true } : { error: "REQUEST_FAILED" }),
    { status: result.response.status }
  );

  if (result.session) {
    writeWonApiSession(response.cookies, result.session);
  } else if (result.shouldClearSession) {
    clearWonApiSession(response.cookies);
  }

  return response;
}
