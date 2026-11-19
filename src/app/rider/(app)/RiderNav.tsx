"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, House, Inbox, PiggyBank, ShoppingBag } from "lucide-react";
import type { Lang } from "@/lib/types";

const ITEMS: { href: string; icon: typeof House; label: Record<Lang, string> }[] = [
  { href: "/rider/home", icon: House, label: { EN: "Home", SW: "Nyumbani", SH: "Home" } },
  { href: "/rider/learn", icon: BookOpen, label: { EN: "Learn", SW: "Jifunze", SH: "Soma" } },
  { href: "/rider/products", icon: ShoppingBag, label: { EN: "Products", SW: "Bidhaa", SH: "Deals" } },
  { href: "/rider/goal", icon: PiggyBank, label: { EN: "Savings", SW: "Akiba", SH: "Savings" } },
  { href: "/rider/inbox", icon: Inbox, label: { EN: "Inbox", SW: "Ujumbe", SH: "Messages" } },
];

/**
 * The bottom bar, flush to the edge rather than a floating pill.
 *
 * The active item is marked by a single accent rule above it and by weight,
 * not by a filled block — at this size a filled tab reads as a button and
 * competes with the content above it.
 */
export default function RiderNav({ lang, unread }: { lang: Lang; unread: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md grid grid-cols-5 z-30"
      data-theme-surface
      style={{ background: "var(--ground)", borderTop: "1px solid var(--rule)" }}
    >
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-1.5 relative"
            style={{
              minHeight: "60px",
              paddingBottom: "0.5rem",
              paddingTop: "0.6rem",
              color: active ? "var(--on-ground)" : "var(--on-black-4)",
              borderTop: `1px solid ${active ? "var(--accent)" : "transparent"}`,
              marginTop: "-1px",
              textDecoration: "none",
              transition: "color 0.35s var(--ease), border-color 0.35s var(--ease)",
            }}
          >
            <Icon size={17} strokeWidth={1.9} />
            <span
              style={{
                fontSize: "0.5rem",
                fontWeight: active ? 700 : 600,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {item.label[lang]}
            </span>
            {item.href === "/rider/inbox" && unread > 0 ? (
              <span
                className="absolute"
                style={{
                  top: "0.5rem",
                  right: "22%",
                  minWidth: "15px",
                  height: "15px",
                  background: "var(--accent)",
                  color: "#fff",
                  fontSize: "0.5rem",
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  padding: "0 3px",
                }}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
