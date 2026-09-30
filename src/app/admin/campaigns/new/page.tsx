import Link from "next/link";
import { all } from "@/lib/db";
import Composer from "./Composer";

export const dynamic = "force-dynamic";

export default async function NewCampaignPage() {
  const stages = await all<{ id: string; name: string; subCounty: string }>(
    "SELECT id, name, subCounty FROM Stage ORDER BY name",
  );
  const subCounties = (
    await all<{ subCounty: string }>("SELECT DISTINCT subCounty FROM Stage ORDER BY subCounty")
  ).map((r) => r.subCounty);

  const products = await all<{ id: string; name: string; partnerName: string; summaryEn: string; summarySw: string; summarySh: string }>(
    `SELECT p.id, p.name, pt.name AS partnerName, p.summaryEn, p.summarySw, p.summarySh
       FROM Product p JOIN Partner pt ON pt.id = p.partnerId
      WHERE p.active = 1 ORDER BY pt.name, p.name`,
  );

  const lessons = await all<{ id: string; code: string; titleEn: string; smsEn: string; smsSw: string; smsSh: string; moduleKey: string }>(
    `SELECT id, code, titleEn, smsEn, smsSw, smsSh, moduleKey FROM Lesson WHERE active = 1 ORDER BY moduleKey, "order"`,
  );

  return (
    <div className="space-y-5">
      <header>
        <Link href="/admin/campaigns" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
          ← Campaigns
        </Link>
        <h1 className="text-[2rem] leading-tight mt-1">Compose a campaign</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          Write once in three languages, choose who it reaches, and the engine picks each rider&rsquo;s preferred
          channel automatically.
        </p>
      </header>

      <Composer stages={stages} subCounties={subCounties} products={products} lessons={lessons} />
    </div>
  );
}
