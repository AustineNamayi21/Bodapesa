import Link from "next/link";
import { all } from "@/lib/db";
import { Card } from "@/components/ui";
import RiderForm from "./RiderForm";

export const dynamic = "force-dynamic";

export default async function NewRiderPage() {
  const stages = await all<{ id: string; name: string; subCounty: string }>(
    "SELECT id, name, subCounty FROM Stage ORDER BY name",
  );

  return (
    <div className="max-w-2xl space-y-5">
      <header>
        <Link href="/admin/riders" className="text-[0.78rem] text-[var(--text-faint)] hover:underline">
          ← Rider registry
        </Link>
        <h1 className="text-xl font-semibold tracking-tight mt-1">Register a rider</h1>
        <p className="text-xs text-[var(--text-faint)] mt-0.5">
          Used by field officers enrolling riders at a stage. The baseline questions below are what the
          programme measures its impact against, so they are worth asking properly.
        </p>
      </header>

      <Card>
        <RiderForm stages={stages} />
      </Card>
    </div>
  );
}
