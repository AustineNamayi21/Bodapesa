import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin";
import LessonForm from "../LessonForm";

export const dynamic = "force-dynamic";

export default async function NewLessonPage() {
  const user = await currentUser();
  if (user?.role !== "PLATFORM_ADMIN") redirect("/admin/curriculum");

  return (
    <div>
      <PageHeader
        title="New lesson"
        subtitle="A lesson needs its three titles, three bodies and three SMS versions before riders can see it. Structured sections are optional — without them the lesson renders from its prose body."
        back="/admin/curriculum"
        backLabel="Curriculum"
      />
      <LessonForm />
    </div>
  );
}
