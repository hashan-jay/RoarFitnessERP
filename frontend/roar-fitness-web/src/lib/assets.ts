const API_BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

/** Resolves relative upload paths from the API host for img src attributes. */
export function resolveAssetUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`;
}
