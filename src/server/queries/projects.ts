import { db } from "@/db";
import {
  projects,
  users,
  workflows,
  workflowStages,
  projectStageRuns,
} from "@/db/schema";
import { desc, eq, asc, ne } from "drizzle-orm";

export type ProjectListRow = {
  id: string;
  code: string;
  name: string;
  designClass: "A" | "B" | "C";
  status: "in_progress" | "on_hold" | "completed" | "archived";
  designerName: string;
  designerEmail: string;
  currentStageNumber: string | null;
  currentStageName: string | null;
  createdAt: Date;
};

export async function listProjects(): Promise<ProjectListRow[]> {
  const rows = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      designClass: projects.designClass,
      status: projects.status,
      designerName: users.name,
      designerEmail: users.email,
      currentStageNumber: workflowStages.stageNumber,
      currentStageName: workflowStages.name,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .innerJoin(users, eq(users.id, projects.designerId))
    .leftJoin(workflowStages, eq(workflowStages.id, projects.currentStageId))
    .orderBy(desc(projects.createdAt));

  return rows;
}

export async function getProjectById(projectId: string) {
  const [row] = await db
    .select({
      project: projects,
      designer: users,
      workflow: workflows,
    })
    .from(projects)
    .innerJoin(users, eq(users.id, projects.designerId))
    .innerJoin(workflows, eq(workflows.id, projects.workflowId))
    .where(eq(projects.id, projectId))
    .limit(1);

  return row ?? null;
}

export type StageRunForStepper = {
  stageId: string;
  stageNumber: string;
  stageName: string;
  isLockGate: boolean;
  requiresApproval: boolean;
  displayOrder: number;
  // status of the latest run for that stage on this project, if any
  runId: string | null;
  runStatus:
    | "not_started"
    | "in_progress"
    | "awaiting_approval"
    | "approved"
    | "skipped"
    | null;
  runNumber: number | null;
};

/**
 * Returns all stages of the project's workflow with the latest run status
 * (if a run exists) joined in. Used for the project detail stepper.
 */
export async function getProjectStepperRows(
  projectId: string,
  workflowId: string
): Promise<StageRunForStepper[]> {
  const stageRows = await db
    .select()
    .from(workflowStages)
    .where(eq(workflowStages.workflowId, workflowId))
    .orderBy(asc(workflowStages.displayOrder));

  const runRows = await db
    .select()
    .from(projectStageRuns)
    .where(eq(projectStageRuns.projectId, projectId));

  // Pick the latest run per stage (highest run_number).
  const latestByStage = new Map<string, (typeof runRows)[number]>();
  for (const r of runRows) {
    const prev = latestByStage.get(r.stageId);
    if (!prev || r.runNumber > prev.runNumber) latestByStage.set(r.stageId, r);
  }

  return stageRows.map((s) => {
    const run = latestByStage.get(s.id) ?? null;
    return {
      stageId: s.id,
      stageNumber: s.stageNumber,
      stageName: s.name,
      isLockGate: s.isLockGate,
      requiresApproval: s.requiresApproval,
      displayOrder: s.displayOrder,
      runId: run?.id ?? null,
      runStatus: run?.status ?? null,
      runNumber: run?.runNumber ?? null,
    };
  });
}

export async function listDesigners() {
  return db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(ne(users.role, "viewer"))
    .orderBy(asc(users.name));
}

export async function projectCodeExists(code: string): Promise<boolean> {
  const [row] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.code, code))
    .limit(1);
  return !!row;
}

export type DashboardStats = {
  active: number;
  awaitingApproval: number;
  completed: number;
  stagesDone: number;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const projectRows = await db
    .select({ status: projects.status })
    .from(projects);

  const active = projectRows.filter((p) => p.status === "in_progress").length;
  const completed = projectRows.filter((p) => p.status === "completed").length;

  const runRows = await db
    .select({ status: projectStageRuns.status })
    .from(projectStageRuns);

  const awaitingApproval = runRows.filter(
    (r) => r.status === "awaiting_approval"
  ).length;
  const stagesDone = runRows.filter((r) => r.status === "approved").length;

  return { active, awaitingApproval, completed, stagesDone };
}

