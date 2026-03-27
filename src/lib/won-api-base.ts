function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

type WonApiConfigErrorCode =
  | "WON_API_BASE_URL_NOT_CONFIGURED"
  | "WON_API_BASE_URL_INVALID"
  | "WON_API_BASE_URL_SELF_REFERENCE";

export class WonApiConfigError extends Error {
  code: WonApiConfigErrorCode;

  constructor(code: WonApiConfigErrorCode, message: string) {
    super(message);
    this.name = "WonApiConfigError";
    this.code = code;
  }
}

export function getWonApiConfigErrorDetails(error: unknown) {
  if (!(error instanceof WonApiConfigError)) {
    return null;
  }

  return {
    status: 500,
    body: {
      error: error.code,
      message: error.message,
    },
  };
}

export function getWonApiBaseUrl(requestUrl?: string) {
  const configured =
    process.env.WON_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configured) {
    throw new WonApiConfigError(
      "WON_API_BASE_URL_NOT_CONFIGURED",
      "WON_API_BASE_URL is not configured."
    );
  }

  let baseUrl: URL;
  try {
    baseUrl = new URL(configured);
  } catch {
    throw new WonApiConfigError(
      "WON_API_BASE_URL_INVALID",
      "WON_API_BASE_URL must be a valid absolute URL."
    );
  }

  if (requestUrl) {
    try {
      const requestOrigin = new URL(requestUrl).origin;
      if (requestOrigin === baseUrl.origin) {
        throw new WonApiConfigError(
          "WON_API_BASE_URL_SELF_REFERENCE",
          "WON_API_BASE_URL points to the current web app origin. Point it to the won-api deployment instead."
        );
      }
    } catch (error) {
      if (error instanceof WonApiConfigError) {
        throw error;
      }
    }
  }

  return trimTrailingSlash(baseUrl.toString());
}

export function buildWonApiUrl(path: string, requestUrl?: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getWonApiBaseUrl(requestUrl)}${normalizedPath}`;
}
