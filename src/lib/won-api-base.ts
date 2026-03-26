function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getWonApiBaseUrl() {
  const configured =
    process.env.WON_API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configured) {
    throw new Error("WON_API_BASE_URL is not configured.");
  }

  return trimTrailingSlash(configured);
}

export function buildWonApiUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getWonApiBaseUrl()}${normalizedPath}`;
}
