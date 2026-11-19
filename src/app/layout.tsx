import type { Metadata, Viewport } from "next";

import { themeBootScript } from "@/components/theme";

/**
 * One typeface, across everything.
 *
 * The reference design language runs the entire site on a single grotesque,
 * and that restraint is load-bearing: with no second family competing, the
 * hierarchy is carried purely by scale and tracking — an 11px label at
 * 0.22em against a 92px headline at 0.9 line-height.
 *
 * Archivo's `wdth` axis supplies the slightly expanded display cut without a
 * second file, so the headlines sit wide without faking it through
 * letter-spacing. Served from the application's own bundle: no font CDN at
 * build time or at runtime, so the build works offline and the page makes no
 * third-party request.
 */
import "@fontsource-variable/archivo/wdth.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BodaPesa — Financial literacy for Nairobi's boda boda riders",
  description:
    "A multi-channel platform that delivers financial literacy and connects boda boda riders in Nairobi to savings, credit, investment and insurance products from Stima DT SACCO and Britam.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the boot script below sets data-theme before
    // React arrives, so the attribute legitimately differs from the server's.
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
