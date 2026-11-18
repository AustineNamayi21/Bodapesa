import { all } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import StageManager, { type StageRow } from "./StageManager";

export const dynamic = "force-dynamic";

export default async function StagesPage() {
  const user = await currentUser();
  const canEdit = user?.role === "PLATFORM_ADMIN";

  const stages = await all<StageRow>(
    `SELECT s.*, (SELECT COUNT(*) FROM Rider r WHERE r.stageId = s.id) AS riders
       FROM Stage s ORDER BY s.subCounty, s.name`,
  );

  return (
    <div>
      <PageHeader
        title="Stages"
        subtitle="The boda stages the programme covers. A rider's stage drives campaign segmentation, the sub-county breakdown on the dashboard, and which chairperson a field officer calls."
      />
      <StageManager stages={stages} canEdit={canEdit} />
    </div>
  );
}
