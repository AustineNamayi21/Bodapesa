import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/plus-jakarta-sans";
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
    { media: "(prefers-color-scheme: light)", color: "#fff7ec" },
    { media: "(prefers-color-scheme: dark)", color: "#140f0b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
