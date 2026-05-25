import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardMark } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, listProjects } from "@/server/queries/projects";
import { listAwaitingApprovalForCeo } from "@/server/queries/stage-runs";
import { getCurrentUser } from "@/server/auth";
import { Lock, ArrowRight, Plus } from "lucide-react";

export const metadata = {
  title: `Dashboard — ${APP_NAME}`,
  description: "Overview of projects, pending approvals, and recent activity.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const isCeo = user?.role === "ceo";

  const [stats, projects, awaitingForCeo] = await Promise.all([
    getDashboardStats().catch(() => ({
      active: 0,
      awaitingApproval: 0,
      completed: 0,
      stagesDone: 0,
    })),
    listProjects().catch(() => []),
    isCeo ? listAwaitingApprovalForCeo().catch(() => []) : Promise.resolve([]),
  ]);

  const myProjects = user
    ? projects.filter((p) => p.designerEmail === user.email)
    : [];
  const recentProjects = projects.slice(0, 5);

  const statsCards = [
    { label: "Active", value: stats.active, mark: "§ 01" },
    { label: "Awaiting", value: stats.awaitingApproval, mark: "§ 02" },
    { label: "Completed", value: stats.completed, mark: "§ 03" },
    { label: "Stages cleared", value: stats.stagesDone, mark: "§ 04" },
  ];

  return (
    <div className="space-y-10">
      {/* ── Page header ─────────────────────────────────────────── */}
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-ink" />
          <span className="mono-caps text-ink-3">Section 00 · Overview</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(40px,5vw,56px)] leading-[1.02] text-ink">
              {user ? `Good day, ${user.name.split(" ")[0]}.` : "Dashboard"}
            </h1>
            <p className="mt-2 font-display text-[18px] text-ink-2">
              {isCeo
                ? "Your approvals queue, project status, and recent activity."
                : "Your project status and recent activity."}
            </p>
          </div>
          {isCeo && (
            <Button asChild variant="signal" size="lg">
              <Link href="/projects/new">
                <Plus className="size-3.5" />
                Open project
              </Link>
            </Button>
          )}
        </div>
      </header>

      {/* ── Stats: specification-table style ────────────────────── */}
      <section className="border-y border-ink/80 divide-x divide-rule grid grid-cols-2 md:grid-cols-4">
        {statsCards.map((s) => (
          <div key={s.label} className="relative py-5 px-5">
            <span className="section-mark absolute right-3 top-2">{s.mark}</span>
            <div className="mono-caps text-ink-3 mb-2">{s.label}</div>
            <div className="font-display text-[44px] leading-none tabular text-ink">
              {String(s.value).padStart(2, "0")}
            </div>
          </div>
        ))}
      </section>

      {/* ── CEO approvals queue (full-width when present) ─────── */}
      {isCeo && awaitingForCeo.length > 0 && (
        <Card>
          <CardMark>§ 02</CardMark>
          <CardHeader>
            <CardTitle>Awaiting your decision</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-rule">
              {awaitingForCeo.map((a) => (
                <li key={a.runId}>
                  <Link
                    href={`/projects/${a.projectId}/stages/${a.runId}`}
                    className="group relative grid grid-cols-[auto_1fr_auto_auto] items-center gap-4 px-5 py-3.5 hover:bg-warn-soft/40 transition-colors"
                  >
                    {/* Left signal stripe */}
                    <span
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-warn"
                      aria-hidden
                    />
                    <div className="size-2 bg-warn rounded-full" />
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[11px] text-ink-3">
                          {a.projectCode}
                        </span>
                        <span className="text-[14px] font-medium text-ink">
                          {a.projectName}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-2">
                        Stage {a.stageNumber} ·{" "}
                        <span className="text-ink">{a.stageName}</span>{" "}
                        · by {a.designerName}
                      </div>
                    </div>
                    {a.isLockGate && (
                      <Badge variant="alert" className="gap-1">
                        <Lock className="size-2" />
                        LOCK
                      </Badge>
                    )}
                    <span className="font-mono text-[11px] text-ink-3 group-hover:text-ink flex items-center gap-1">
                      Review
                      <ArrowRight className="size-3" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* ── Two-column: recent projects + designer view ─────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardMark>§ 03.1</CardMark>
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {recentProjects.length === 0 ? (
              <EmptyState text="No projects yet." />
            ) : (
              <ul className="divide-y divide-rule">
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 hover:bg-paper-3 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
                          {p.code}
                        </div>
                        <div className="mt-0.5 text-[14px] font-medium text-ink">
                          {p.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mono-caps text-ink-4">Stage</div>
                        <div className="font-mono text-[12px] text-ink">
                          {p.currentStageNumber ?? "—"}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardMark>§ 03.2</CardMark>
          <CardHeader>
            <CardTitle>
              {user?.role === "designer"
                ? "Assigned to you"
                : isCeo
                  ? "Activity"
                  : "Your view"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {user?.role === "designer" ? (
              myProjects.length === 0 ? (
                <EmptyState text="No projects assigned to you yet." />
              ) : (
                <ul className="divide-y divide-rule">
                  {myProjects.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3 hover:bg-paper-3 transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
                            {p.code}
                          </div>
                          <div className="mt-0.5 text-[14px] font-medium text-ink">
                            {p.name}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="mono-caps text-ink-4">Stage</div>
                          <div className="font-mono text-[12px] text-ink">
                            {p.currentStageNumber ?? "—"}
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : isCeo && awaitingForCeo.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <div className="mono-caps text-ink-4 mb-2">
                  Queue empty
                </div>
                <p className="text-[12px] text-ink-3">
                  Nothing awaiting your approval right now.
                </p>
              </div>
            ) : (
              <EmptyState text="Activity feed coming soon." />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-[12px] text-ink-3">{text}</p>
    </div>
  );
}
