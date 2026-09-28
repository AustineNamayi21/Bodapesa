"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/types";

const ITEMS: { href: string; icon: string; label: Record<Lang, string> }[] = [
  { href: "/rider/home", icon: "⌂", label: { EN: "Home", SW: "Nyumbani", SH: "Home" } },
  { href: "/rider/learn", icon: "❑", label: { EN: "Learn", SW: "Jifunze", SH: "Soma" } },
  { href: "/rider/products", icon: "◆", label: { EN: "Products", SW: "Bidhaa", SH: "Deals" } },
  { href: "/rider/goal", icon: "◎", label: { EN: "Savings", SW: "Akiba", SH: "Savings" } },
  { href: "/rider/inbox", icon: "✉", label: { EN: "Inbox", SW: "Ujumbe", SH: "Messages" } },
];

export default function RiderNav({ lang, unread }: { lang: Lang; unread: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t grid grid-cols-5 z-20"
      style={{ background: "var(--surface)" }}
    >
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-2.5 relative"
            style={{ color: active ? "var(--brand)" : "var(--text-faint)" }}
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span className="text-[0.64rem] font-medium">{item.label[lang]}</span>
            {item.href === "/rider/inbox" && unread > 0 ? (
              <span
                className="absolute top-1.5 right-[22%] min-w-[15px] h-[15px] rounded-full text-[0.58rem] grid place-items-center px-1 font-bold"
                style={{ background: "var(--accent)", color: "#211404" }}
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
