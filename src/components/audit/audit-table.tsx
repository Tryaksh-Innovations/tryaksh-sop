import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const ACTION_LABEL: Record<string, string> = {
  project_created: "Project created",
  stage_started: "Stage started",
  checklist_item_toggled: "Checklist response",
  approval_requested: "Approval requested",
  approval_granted: "Approval granted",
  approval_denied: "Sent back",
  schematic_reopened: "Schematic reopened",
  project_archived: "Project archived",
  project_status_changed: "Status changed",
  external_link_added: "Link added",
  external_link_removed: "Link removed",
  user_created: "User created",
  user_role_changed: "Role changed",
};

const ACTION_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal"
> = {
  project_created: "blueprint",
  approval_requested: "warn",
  approval_granted: "seal",
  approval_denied: "alert",
  schematic_reopened: "alert",
  project_archived: "alert",
  user_role_changed: "signal",
  external_link_added: "secondary",
  external_link_removed: "secondary",
  checklist_item_toggled: "outline",
  project_status_changed: "secondary",
};

export interface AuditTableRow {
  id: string;
  timestamp: Date;
  actorEmail: string;
  actorRole: string;
  action: string;
  entityType: string;
  afterJson: unknown;
}

function formatDate(d: Date) {
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function summary(entry: Pick<AuditTableRow, "action" | "afterJson">) {
  const a = entry.afterJson as Record<string, unknown> | null;
  if (!a) return null;
  if (entry.action === "checklist_item_toggled") {
    if (a.checked) return "checked with initials";
    if (a.naReason) return "marked N/A";
    return "cleared";
  }
  if (
    entry.action === "approval_granted" ||
    entry.action === "approval_requested"
  ) {
    const stageName = a.stageName as string | undefined;
    return stageName
      ? `${stageName}${a.note ? ` — ${a.note as string}` : ""}`
      : null;
  }
  if (entry.action === "approval_denied") {
    return (a.note as string) ?? null;
  }
  if (entry.action === "schematic_reopened") {
    return `New Stage 6 run #${a.newStage6RunNumber}${a.note ? ` — ${a.note as string}` : ""}`;
  }
  if (entry.action === "external_link_added") {
    return `${a.kind as string}: ${a.label as string}`;
  }
  if (entry.action === "project_created") {
    return `${a.code as string} — ${a.name as string}`;
  }
  if (entry.action === "user_role_changed") {
    return `${a.email ?? ""} → ${a.role as string}`;
  }
  return null;
}

export function AuditTable({ entries }: { entries: AuditTableRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-5 w-44">When (IST)</TableHead>
          <TableHead className="w-44">Action</TableHead>
          <TableHead>Actor</TableHead>
          <TableHead className="pr-5">Detail</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((e) => (
          <TableRow key={e.id}>
            <TableCell className="pl-5 align-top font-mono text-[11px] text-ink-2">
              {formatDate(e.timestamp)}
            </TableCell>
            <TableCell className="align-top">
              <Badge variant={ACTION_VARIANT[e.action] ?? "secondary"}>
                {ACTION_LABEL[e.action] ?? e.action}
              </Badge>
            </TableCell>
            <TableCell className="align-top">
              <div className="text-[12px] text-ink">{e.actorEmail}</div>
              <div className="mono-caps text-ink-3">{e.actorRole}</div>
            </TableCell>
            <TableCell className="pr-5 align-top text-[12px] text-ink-2 leading-snug">
              {summary(e) ?? <span className="text-ink-4">—</span>}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
