"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Package,
  Phone,
  Plug,
  Users,
} from "lucide-react";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/riders", label: "Riders", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/messages", label: "Message log", icon: Inbox },
  { href: "/admin/leads", label: "Leads", icon: HeartHandshake },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/curriculum", label: "Curriculum", icon: BookOpen },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
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
        const Icon = l.icon;
        return (
          <Link key={l.href} href={l.href} className="nav-link shrink-0" data-active={active}>
            <Icon size={17} strokeWidth={active ? 2.5 : 2} />
            {l.label}
          </Link>
        );
      })}
      <Link href="/ussd" className="nav-link shrink-0" data-active={false}>
        <Phone size={17} />
        USSD simulator
      </Link>
    </nav>
  );
}
