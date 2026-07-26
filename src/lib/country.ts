import { headers } from 'next/headers';

const ISO_COUNTRY = /^[A-Z]{2}$/;

/**
 * Detect visitor country from CDN / platform request headers.
 * Amplify/CloudFront: cloudfront-viewer-country
 * Vercel: x-vercel-ip-country
 * Cloudflare: cf-ipcountry
 *
 * Returns undefined when absent or invalid — never pass sentinels like OTHERS to Paddle.
 */
export async function getRequestCountryCode(): Promise<string | undefined> {
  const h = await headers();
  const candidates = [
    h.get('cloudfront-viewer-country'),
    h.get('x-vercel-ip-country'),
    h.get('cf-ipcountry'),
    h.get('x-country-code'),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const code = raw.trim().toUpperCase();
    if (code === 'XX' || code === 'T1' || code === 'OTHERS' || code === 'UNKNOWN') {
      continue;
    }
    if (ISO_COUNTRY.test(code)) return code;
  }
  return undefined;
}
