"use client";

/**
 * next/image loader. Photos are served straight from Unsplash's image CDN,
 * which resizes and re-encodes on the fly, so no image optimisation quota is
 * spent on the host. Anything else is returned untouched.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 72));
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    return url.toString();
  }
  return src;
}
