"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Building2,
  HandCoins,
  HeartHandshake,
  Inbox,
  LayoutDashboard,
  MapPin,
  Megaphone,
  Package,
  Plug,
  Users,
} from "lucide-react";

/**
 * Grouped so the console reads as three jobs rather than one long list:
 * who we reach, what we offer them, and how the platform is wired.
 */
const GROUPS: { label: string; links: { href: string; label: string; icon: typeof Users }[] }[] = [
  {
    label: "Programme",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/riders", label: "Riders", icon: Users },
      { href: "/admin/stages", label: "Stages", icon: MapPin },
    ],
  },
  {
    label: "Outreach",
    links: [
      { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
      { href: "/admin/messages", label: "Message log", icon: Inbox },
      { href: "/admin/leads", label: "Leads", icon: HeartHandshake },
    ],
  },
  {
    label: "Catalogue",
    links: [
      { href: "/admin/products", label: "Products", icon: Package },
      { href: "/admin/partners", label: "Partners", icon: Building2 },
      { href: "/admin/curriculum", label: "Curriculum", icon: BookOpen },
    ],
  },
  {
    label: "Platform",
    links: [
      { href: "/admin/donations", label: "Donations", icon: HandCoins },
      { href: "/admin/integrations", label: "Integrations", icon: Plug },
    ],
  },
];

// Partner staff manage their own pipeline; curriculum, partners, stages,
// donations and channel configuration belong to the platform team.
const PLATFORM_ONLY = new Set([
  "/admin/curriculum",
  "/admin/partners",
  "/admin/stages",
  "/admin/donations",
  "/admin/integrations",
]);

export default function NavLinks({ role }: { role: string }) {
  const pathname = usePathname();
  const partner = role === "PARTNER_ADMIN";

  return (
    <nav
      className="flex lg:flex-col gap-5 lg:gap-0 overflow-x-auto lg:overflow-visible no-scrollbar"
      style={{ padding: "1rem 1.25rem" }}
    >
      {GROUPS.map((group) => {
        const links = partner ? group.links.filter((l) => !PLATFORM_ONLY.has(l.href)) : group.links;
        if (!links.length) return null;

        return (
          <div key={group.label} className="contents lg:block lg:mb-4">
            <span
              className="hidden lg:block"
              style={{
                fontSize: "0.5625rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: "var(--on-black-4)",
                paddingBottom: "0.5rem",
              }}
            >
              {group.label}
            </span>
            {links.map((l) => {
              const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
              const Icon = l.icon;
              return (
                <Link key={l.href} href={l.href} className="nav-link shrink-0" data-active={active}>
                  <Icon size={14} strokeWidth={active ? 2.2 : 1.7} />
                  {l.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
