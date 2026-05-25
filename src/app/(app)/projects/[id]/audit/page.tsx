import Link from "next/link";
import { notFound } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/audit-table";
import { requireUser } from "@/server/auth";
import { getProjectById } from "@/server/queries/projects";
import { getAuditLogForProject } from "@/server/queries/audit";
import { ArrowLeft, ScrollText, Download } from "lucide-react";

export const metadata = {
  title: `Project audit — ${APP_NAME}`,
};

export default async function ProjectAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser();

  const projectRow = await getProjectById(id).catch(() => null);
  if (!projectRow) notFound();
  const { project } = projectRow;

  const entries = await getAuditLogForProject(project.id).catch(() => []);

  return (
    <div className="space-y-8">
      <Link
        href={`/projects/${project.id}`}
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to project
      </Link>

      <header className="border-t border-rule-3 pt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ScrollText className="size-3.5 text-ink-3" />
            <span className="mono-caps text-ink-3">{project.code} · Audit log</span>
          </div>
          <h1 className="display text-[clamp(36px,5vw,48px)] leading-[1.02] text-ink">
            Audit log
          </h1>
          <p className="mt-2 font-display text-[16px] text-ink-2 max-w-2xl">
            Every state-changing action on this project, append-only and
            tamper-evident. Times in IST.
          </p>
        </div>
        {entries.length > 0 && (
          <Button asChild variant="outline">
            <a href={`/api/audit/project/${project.id}/export`} download>
              <Download className="size-3" />
              Export CSV
            </a>
          </Button>
        )}
      </header>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mono-caps text-ink-3 mb-2">Empty</div>
            <p className="text-[13px] text-ink-2">No actions logged yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-ink/80">
          <div className="border-b border-ink/80 bg-paper-2/60 px-5 py-2.5">
            <span className="mono-caps text-ink-2">
              {entries.length} entries · most recent first
            </span>
          </div>
          <AuditTable entries={entries} />
        </div>
      )}
    </div>
  );
}
