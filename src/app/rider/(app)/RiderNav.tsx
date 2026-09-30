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

export default function RiderNav({ lang, unread }: { lang: Lang; unread: number }) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-[calc(28rem-1.5rem)] grid grid-cols-5 z-30 rounded-[22px] p-1.5 border-2"
      style={{ background: "var(--ink)", borderColor: "var(--ink)", boxShadow: "0 12px 30px -8px rgba(26,18,11,0.45)" }}
    >
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 py-1.5 relative rounded-2xl transition-all duration-200"
            style={{
              color: active ? "var(--ink)" : "rgba(255,243,228,0.6)",
              background: active ? "var(--sunset)" : "transparent",
            }}
          >
            <Icon size={19} strokeWidth={active ? 2.6 : 2} className={active ? "animate-pop" : ""} />
            <span className="text-[0.6rem] font-bold">{item.label[lang]}</span>
            {item.href === "/rider/inbox" && unread > 0 ? (
              <span
                className="absolute top-0.5 right-[18%] min-w-[16px] h-[16px] rounded-full text-[0.58rem] grid place-items-center px-1 font-extrabold border-2 animate-pulse-ring"
                style={{ background: "var(--matatu)", color: "var(--ink)", borderColor: "var(--ink)" }}
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
