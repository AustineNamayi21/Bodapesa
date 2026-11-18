import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import PartnerManager, { type PartnerRow } from "./PartnerManager";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const user = await currentUser();
  const canEdit = user?.role === "PLATFORM_ADMIN";

  const partners = await all<PartnerRow>(
    `SELECT pt.*,
            (SELECT COUNT(*) FROM Product p WHERE p.partnerId = pt.id) AS products,
            (SELECT COUNT(*) FROM Lead l WHERE l.partnerId = pt.id) AS leads,
            (SELECT COUNT(*) FROM AppUser u WHERE u.partnerId = pt.id) AS staff
       FROM Partner pt ORDER BY pt.name`,
  );

  return (
    <div>
      <PageHeader
        title="Partners"
        subtitle="The financial institutions riders are onboarded to. A partner owns its products and its lead pipeline, and its staff accounts see only their own."
      />
      <PartnerManager partners={partners} canEdit={canEdit} />
    </div>
  );
}
