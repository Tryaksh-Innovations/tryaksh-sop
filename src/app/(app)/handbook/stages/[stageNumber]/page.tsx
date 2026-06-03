import { redirect } from "next/navigation";

/**
 * Back-compat redirect — handbook stage URLs are now scoped under
 * /handbook/[workflow]/stages/[stageNumber]. Old bookmarks pointing
 * at the PCB workflow land here and bounce to the new path.
 */
export default async function LegacyStageRedirect({
  params,
}: {
  params: Promise<{ stageNumber: string }>;
}) {
  const { stageNumber } = await params;
  redirect(`/handbook/pcb/stages/${stageNumber}`);
}
