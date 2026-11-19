"use client";

/**
 * next/image loader. Photos are served straight from the stock CDNs, which
 * resize and re-encode on the fly, so no image optimisation quota is spent on
 * the host. Unsplash and Pexels each take their own query parameters;
 * anything else is returned untouched.
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
  if (src.startsWith("https://images.pexels.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "compress");
    url.searchParams.set("cs", "tinysrgb");
    url.searchParams.set("w", String(width));
    return url.toString();
  }
  return src;
}
