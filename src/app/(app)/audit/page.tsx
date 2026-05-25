import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuditTable } from "@/components/audit/audit-table";
import { getGlobalAuditLog } from "@/server/queries/audit";
import { requireUser } from "@/server/auth";
import { ScrollText, Download } from "lucide-react";

export const metadata = {
  title: `Global audit log — ${APP_NAME}`,
  description: "Complete audit trail across all projects.",
};

export default async function GlobalAuditPage() {
  const user = await requireUser();
  if (user.role !== "ceo" && user.role !== "viewer") {
    redirect("/");
  }

  const entries = await getGlobalAuditLog(500).catch(() => []);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-ink" />
          <span className="mono-caps text-ink-3">Section 03 · Records</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ScrollText className="size-3.5 text-ink-3" />
              <span className="mono-caps text-ink-3">Audit log</span>
            </div>
            <h1 className="display text-[clamp(40px,5vw,56px)] leading-[1.02] text-ink">
              Records
            </h1>
            <p className="mt-2 font-display text-[18px] text-ink-2 max-w-2xl">
              Append-only record of every state-changing action across all
              projects. Most recent {entries.length} entries shown. Times in
              IST.
            </p>
          </div>
          {entries.length > 0 && (
            <Button asChild variant="outline">
              <a href="/api/audit/global/export" download>
                <Download className="size-3" />
                Export CSV
              </a>
            </Button>
          )}
        </div>
      </header>

      {entries.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mono-caps text-ink-3 mb-2">Empty</div>
            <p className="text-[13px] text-ink-2">No audit entries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="border border-ink/80">
          <div className="border-b border-ink/80 bg-paper-2/60 px-5 py-2.5">
            <span className="mono-caps text-ink-2">
              Chronological · most recent first
            </span>
          </div>
          <AuditTable entries={entries} />
        </div>
      )}
    </div>
  );
}
