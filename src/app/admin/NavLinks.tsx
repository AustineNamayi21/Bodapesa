"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: "▦" },
  { href: "/admin/riders", label: "Riders", icon: "◍" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "➤" },
  { href: "/admin/messages", label: "Message log", icon: "✉" },
  { href: "/admin/leads", label: "Leads", icon: "◈" },
  { href: "/admin/products", label: "Products", icon: "◆" },
  { href: "/admin/curriculum", label: "Curriculum", icon: "❑" },
  { href: "/admin/integrations", label: "Integrations", icon: "⚙" },
];

export default function NavLinks({ role }: { role: string }) {
  const pathname = usePathname();
  // Partner staff manage their own pipeline; curriculum and channel
  // configuration belong to the platform team.
  const links =
    role === "PARTNER_ADMIN"
      ? LINKS.filter((l) => l.href !== "/admin/curriculum" && l.href !== "/admin/integrations")
      : LINKS;

  return (
    <nav className="px-3 pb-3 flex lg:flex-col gap-1 overflow-x-auto scroll-thin">
      {links.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className="nav-link shrink-0" data-active={active}>
            <span className="text-[0.85rem] opacity-70">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
      <Link href="/ussd" className="nav-link shrink-0" data-active={false}>
        <span className="text-[0.85rem] opacity-70">☎</span>
        USSD simulator
      </Link>
    </nav>
  );
}
