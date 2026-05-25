import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { listProjects } from "@/server/queries/projects";
import { getCurrentUser } from "@/server/auth";
import { Plus, ArrowRight } from "lucide-react";

export const metadata = {
  title: `Projects — ${APP_NAME}`,
  description: "View and manage PCB design projects.",
};

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal"
> = {
  in_progress: "blueprint",
  on_hold: "warn",
  completed: "seal",
  archived: "outline",
};

const STATUS_LABEL: Record<string, string> = {
  in_progress: "In progress",
  on_hold: "On hold",
  completed: "Completed",
  archived: "Archived",
};

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  const isCeo = user?.role === "ceo";
  const projects = await listProjects().catch(() => []);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-ink" />
          <span className="mono-caps text-ink-3">Section 01 · Projects</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="display text-[clamp(40px,5vw,56px)] leading-[1.02] text-ink">
              Projects
            </h1>
            <p className="mt-2 font-display text-[18px] text-ink-2 max-w-2xl">
              Every PCB project currently moving through the workflow.
              Identified by project code; tracked by current stage.
            </p>
          </div>
          {isCeo && (
            <Button asChild variant="signal">
              <Link href="/projects/new">
                <Plus className="size-3.5" />
                Open project
              </Link>
            </Button>
          )}
        </div>
      </header>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mono-caps text-ink-3 mb-2">Register empty</div>
            <p className="text-[13px] text-ink-2 max-w-md mx-auto">
              {isCeo
                ? "Open your first project to begin a workflow. Stage 1 (Parts Selection) will be created automatically."
                : "No projects yet. The CEO will create projects here."}
            </p>
            {isCeo && (
              <div className="mt-5">
                <Button asChild variant="default">
                  <Link href="/projects/new">
                    <Plus className="size-3.5" />
                    Open project
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="border border-ink/80">
          <div className="border-b border-ink/80 bg-paper-2/60 px-5 py-2.5 flex items-center justify-between">
            <span className="mono-caps text-ink-2">
              Project register · {projects.length} active
            </span>
            <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
              See: TRYAKSH-SOP-PCB-001 §2
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5 w-10">No.</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Designer</TableHead>
                <TableHead>Current stage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p, i) => (
                <TableRow key={p.id}>
                  <TableCell className="pl-5 font-mono text-[10px] text-ink-3 tabular">
                    {String(i + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/projects/${p.id}`} className="group block">
                      <div className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
                        {p.code}
                      </div>
                      <div className="mt-0.5 font-display text-[16px] text-ink group-hover:underline underline-offset-4 decoration-signal">
                        {p.name}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center justify-center size-5 border border-ink font-mono text-[11px] font-medium">
                      {p.designClass}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-[13px] text-ink">{p.designerName}</div>
                    <div className="font-mono text-[10px] text-ink-3">
                      {p.designerEmail}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.currentStageNumber ? (
                      <div>
                        <span className="font-mono text-[10px] text-ink-3">
                          {p.currentStageNumber}
                        </span>
                        <span className="ml-2 text-[12px] text-ink">
                          {p.currentStageName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink-4">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[p.status] ?? "secondary"}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Link
                      href={`/projects/${p.id}`}
                      className="inline-flex items-center mono-caps text-ink-3 hover:text-ink"
                    >
                      Open
                      <ArrowRight className="ml-1 size-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
