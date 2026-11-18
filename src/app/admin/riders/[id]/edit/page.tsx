import { notFound } from "next/navigation";
import { all, one } from "@/lib/db";
import { PageHeader } from "@/components/admin";
import RiderEditForm from "./RiderEditForm";
import type { RiderWithStage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EditRiderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rider = await one<RiderWithStage>(
    `SELECT r.*, s.name AS stageName, s.subCounty
       FROM Rider r LEFT JOIN Stage s ON s.id = r.stageId WHERE r.id = ?`,
    [id],
  );
  if (!rider) notFound();

  const stages = await all<{ id: string; name: string; subCounty: string }>(
    "SELECT id, name, subCounty FROM Stage ORDER BY subCounty, name",
  );

  return (
    <div>
      <PageHeader
        title={`${rider.firstName} ${rider.lastName}`}
        subtitle="Correct a record captured in the field, move a rider between stages, or withdraw messaging consent."
        back={`/admin/riders/${rider.id}`}
        backLabel="Rider profile"
      />
      <RiderEditForm rider={rider} stages={stages} />
    </div>
  );
}
