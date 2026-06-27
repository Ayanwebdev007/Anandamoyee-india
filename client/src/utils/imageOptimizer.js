/**
 * Optimizes image URLs through wsrv.nl CDN proxy for WebP conversion and resizing.
 * Handles: external URLs (S3, ibb.co), AND local Vite-bundled assets (/assets/...).
 * 
 * For local assets: prepends the production domain so wsrv.nl can fetch them.
 * This converts e.g. a 1.4MB 8542×8542 PNG → a ~5KB 315px WebP.
 */
const SITE_ORIGIN = 'https://anandamoyeeindia.com';

export const optimizeImage = (url, width = 600) => {
  if (!url || typeof url !== 'string') return '';

  // Never double-wrap wsrv.nl links, skip data URIs and SVGs
  if (url.includes('wsrv.nl') || url.startsWith('data:') || url.endsWith('.svg')) {
    return url;
  }

  // Local Vite-bundled asset (e.g. /assets/mii-DM7-PM84.png)
  // Prepend the production domain so wsrv.nl can fetch it
  if (url.startsWith('/')) {
    const absoluteUrl = `${SITE_ORIGIN}${url}`;
    return `https://wsrv.nl/?url=${encodeURIComponent(absoluteUrl)}&w=${width}&output=webp&q=80`;
  }

  // External URLs (S3, ibb.co, etc.)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=80`;
  }

  return url;
};
