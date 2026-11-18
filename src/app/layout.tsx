import type { Metadata, Viewport } from "next";

/**
 * Three voices, following the reference design language:
 *
 *   • Archivo          — a wide grotesque, set in tracked capitals for
 *                        labels, buttons, navigation and tabular data.
 *   • Cinzel           — a serif of classical proportion, used for display
 *                        headings and headline figures.
 *   • Playfair Display — the editorial serif that carries long-form reading
 *                        (lesson bodies, marketing copy).
 *
 * All three are installed from npm and served from the application's own
 * bundle, exactly as Outfit and Plus Jakarta Sans were before. Nothing is
 * fetched from a font CDN at build time or at runtime, so the build works
 * offline and there is no third-party request on page load.
 *
 * `wdth` brings Archivo's width axis, which is what lets the tracked capitals
 * sit wide without faking it by letter-spacing alone.
 */
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/cinzel";
import "@fontsource-variable/playfair-display";
import "@fontsource-variable/playfair-display/wght-italic.css";
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
    { media: "(prefers-color-scheme: light)", color: "#f0f3f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d0f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
