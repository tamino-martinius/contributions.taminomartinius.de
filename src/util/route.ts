const LIVE_ROUTE_RE = /^\/~([a-zA-Z\d](?:[a-zA-Z\d]|-(?=[a-zA-Z\d])){0,38})\/?$/;

/** Extracts the GitHub username from a `/~username` path, or null for every other path. */
export const parseLiveUser = (pathname: string): string | null => pathname.match(LIVE_ROUTE_RE)?.[1] ?? null;
