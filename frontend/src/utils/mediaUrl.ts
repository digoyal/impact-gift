/**
 * Resolve image/upload URLs for <img> src. Absolute http(s) URLs pass through.
 * API-relative paths (e.g. /api/uploads/...) are joined to the API host (VITE_API_URL without /api).
 */
export function getApiOrigin(): string {
  const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/$/, '');
  if (apiUrl.endsWith('/api')) {
    return apiUrl.slice(0, -4);
  }
  return apiUrl;
}

export function resolveMediaUrl(url: string | null | undefined): string {
  if (!url?.trim()) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const origin = getApiOrigin();
  return trimmed.startsWith('/') ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}