/**
 * Wraps external S3 or image hosting URLs with Cloudflare global CDN caching & WebP resizing.
 * Eliminates payloads down to ~1MB for God Level 90+ Lighthouse Performance.
 */
export const optimizeImage = (url, width = 600) => {
  if (!url || typeof url !== 'string') return '';
  // If it's a relative asset, SVG, data URI, or already a wsrv link, return as-is
  if (url.startsWith('/') || url.startsWith('data:') || url.includes('wsrv.nl') || url.endsWith('.svg')) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
  }
  return url;
};
