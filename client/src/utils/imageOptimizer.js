/**
 * Wraps external S3, image hosting, or local asset URLs with Cloudflare global CDN caching & WebP resizing.
 * Eliminates payloads down to ~1MB for God Level 90+ Lighthouse Performance.
 */
export const optimizeImage = (url, width = 600) => {
  if (!url || typeof url !== 'string') return '';
  // If it's SVG, data URI, or already a wsrv link, return as-is
  if (url.startsWith('data:') || url.includes('wsrv.nl') || url.endsWith('.svg')) {
    return url;
  }
  let targetUrl = url;
  if (url.startsWith('/')) {
    targetUrl = `https://www.anandamoyeeindia.com${url}`;
  }
  if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(targetUrl)}&w=${width}&output=webp&q=80`;
  }
  return url;
};
