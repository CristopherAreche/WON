type ApiErrorData = Record<string, unknown> | null;

function getApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function buildUrl(path: string) {
  // Same-origin `/api/*` routes are the web bridge to `won-api`.
  // They can attach HttpOnly session cookies server-side.
  if (path.startsWith("/api/")) {
    return path;
  }

  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  data: ApiErrorData;

  constructor(message: string, status: number, code?: string, data: ApiErrorData = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as unknown;
  const data = asObject(payload);

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

  return payload as T;
}

export const http = {
  get<T>(path: string) {
    return request<T>(path);
  },
  post<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "POST",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  put<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "PUT",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  patch<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "PATCH",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
  delete<T>(path: string, body?: unknown) {
    return request<T>(path, {
      method: "DELETE",
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  },
};
