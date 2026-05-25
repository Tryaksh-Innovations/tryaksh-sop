import { NextResponse } from "next/server";
import { requireUser } from "@/server/auth";
import { getProjectById } from "@/server/queries/projects";
import { getAuditLogForProject } from "@/server/queries/audit";
import { toCsv } from "@/lib/csv";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireUser();
  const { id } = await params;

  const projectRow = await getProjectById(id);
  if (!projectRow) return new NextResponse("Not found", { status: 404 });

  const entries = await getAuditLogForProject(id);

  const rows = entries.map((e) => [
    new Date(e.timestamp).toISOString(),
    e.actorEmail,
    e.actorRole,
    e.action,
    e.entityType,
    e.entityId,
    e.afterJson ? JSON.stringify(e.afterJson) : "",
    e.beforeJson ? JSON.stringify(e.beforeJson) : "",
    e.ipAddress ?? "",
    e.userAgent ?? "",
  ]);

  const csv = toCsv(
    [
      "timestamp_utc",
      "actor_email",
      "actor_role",
      "action",
      "entity_type",
      "entity_id",
      "after_json",
      "before_json",
      "ip_address",
      "user_agent",
    ],
    rows
  );

  const filename = `tryaksh-audit-${projectRow.project.code}-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
