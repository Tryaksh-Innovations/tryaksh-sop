"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  projects,
  workflows,
  workflowStages,
  projectStageRuns,
  users,
} from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validators/project";
import { requireRole } from "@/server/auth";

export type CreateProjectResult =
  | { ok: true; projectId: string }
  | { ok: false; error: string; fieldErrors?: Partial<Record<keyof CreateProjectInput, string>> };

export async function createProject(
  raw: unknown
): Promise<CreateProjectResult> {
  // CEO-only. Throws if not signed in or wrong role — server actions
  // surface that as a 500 to the client; the form catches it below.
  const actor = await requireRole("ceo");

  const parsed = createProjectSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const fieldErrors: Partial<Record<keyof CreateProjectInput, string>> = {};
    for (const [key, msgs] of Object.entries(flat.fieldErrors)) {
      if (msgs && msgs.length) {
        fieldErrors[key as keyof CreateProjectInput] = msgs[0];
      }
    }
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const input = parsed.data;

  // Look up the active PCB workflow (v1 has only one).
  const [pcb] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.slug, "pcb"), eq(workflows.isActive, true)))
    .limit(1);

  if (!pcb) {
    return {
      ok: false,
      error: "No active PCB workflow found. Has the database been seeded?",
    };
  }

  // Verify designer exists and isn't a viewer
  const [designer] = await db
    .select()
    .from(users)
    .where(eq(users.id, input.designerId))
    .limit(1);

  if (!designer) {
    return { ok: false, error: "Selected designer was not found." };
  }
  if (designer.role === "viewer") {
    return { ok: false, error: "Viewers cannot be assigned as designers." };
  }

  // Enforce unique project code
  const [existing] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(eq(projects.code, input.code))
    .limit(1);

  if (existing) {
    return {
      ok: false,
      error: "A project with this code already exists.",
      fieldErrors: { code: "Code is already in use" },
    };
  }

  // Find Stage 1 (lowest displayOrder) — used to seed the initial stage run
  const [firstStage] = await db
    .select()
    .from(workflowStages)
    .where(eq(workflowStages.workflowId, pcb.id))
    .orderBy(asc(workflowStages.displayOrder))
    .limit(1);

  if (!firstStage) {
    return {
      ok: false,
      error: "Workflow has no stages. Re-run pnpm db:seed.",
    };
  }

  // Build the audit context from the incoming request (best-effort).
  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    undefined;
  const userAgent = h.get("user-agent") ?? undefined;

  // Insert project, then seed first stage run, then audit. Drizzle's
  // postgres-js driver doesn't expose interactive transactions over the
  // pooler, so we sequence carefully and clean up on failure.
  let createdProjectId: string | null = null;

  try {
    const [createdProject] = await db
      .insert(projects)
      .values({
        workflowId: pcb.id,
        code: input.code,
        name: input.name,
        designClass: input.designClass,
        designerId: input.designerId,
        currentStageId: firstStage.id,
        status: "in_progress",
      })
      .returning();

    if (!createdProject) {
      return { ok: false, error: "Failed to create project (no row returned)." };
    }
    createdProjectId = createdProject.id;

    // Seed Stage 1 run as not_started so the designer can begin
    await db.insert(projectStageRuns).values({
      projectId: createdProject.id,
      stageId: firstStage.id,
      runNumber: 1,
      status: "not_started",
    });

    await writeAuditLog({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "project_created",
      entityType: "projects",
      entityId: createdProject.id,
      afterJson: {
        code: createdProject.code,
        name: createdProject.name,
        designClass: createdProject.designClass,
        designerId: createdProject.designerId,
        workflowId: createdProject.workflowId,
        currentStageId: createdProject.currentStageId,
      },
      ipAddress,
      userAgent,
    });
  } catch (error) {
    logger.error("createProject failed", error, { input });
    // Best-effort cleanup if project was created but later steps failed
    if (createdProjectId) {
      try {
        await db.delete(projects).where(eq(projects.id, createdProjectId));
      } catch (cleanupErr) {
        logger.error("createProject cleanup failed", cleanupErr, {
          projectId: createdProjectId,
        });
      }
    }
    return {
      ok: false,
      error: "Could not create project. Please try again.",
    };
  }

  revalidatePath("/projects");
  revalidatePath("/");
  return { ok: true, projectId: createdProjectId };
}

export async function createProjectAndRedirect(raw: unknown): Promise<never | CreateProjectResult> {
  const result = await createProject(raw);
  if (result.ok) {
    redirect(`/projects/${result.projectId}`);
  }
  return result;
}

// ─────────────────────────────────────────────────────────────────
// Project status transitions
// ─────────────────────────────────────────────────────────────────

const setProjectStatusSchema = z.object({
  projectId: z.string().uuid(),
  status: z.enum(["in_progress", "on_hold", "completed", "archived"]),
  note: z.string().trim().max(500).optional().nullable(),
});

const VALID_TRANSITIONS: Record<string, string[]> = {
  in_progress: ["on_hold", "completed", "archived"],
  on_hold: ["in_progress", "archived"],
  completed: ["archived"],
  archived: [],
};

export type SetProjectStatusResult =
  | { ok: true }
  | { ok: false; error: string };

export async function setProjectStatus(
  raw: unknown
): Promise<SetProjectStatusResult> {
  const actor = await requireRole("ceo");
  const parsed = setProjectStatusSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const input = parsed.data;

  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, input.projectId))
    .limit(1);
  if (!project) return { ok: false, error: "Project not found." };

  const allowed = VALID_TRANSITIONS[project.status] ?? [];
  if (!allowed.includes(input.status)) {
    return {
      ok: false,
      error: `Cannot move from '${project.status}' to '${input.status}'.`,
    };
  }

  const now = new Date();
  await db
    .update(projects)
    .set({
      status: input.status,
      updatedAt: now,
      archivedAt: input.status === "archived" ? now : project.archivedAt,
    })
    .where(eq(projects.id, project.id));

  const h = await headers();
  const ipAddress =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    undefined;
  const userAgent = h.get("user-agent") ?? undefined;

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    actorRole: actor.role,
    action:
      input.status === "archived" ? "project_archived" : "project_status_changed",
    entityType: "projects",
    entityId: project.id,
    beforeJson: { status: project.status },
    afterJson: {
      status: input.status,
      code: project.code,
      name: project.name,
      note: input.note ?? null,
    },
    ipAddress,
    userAgent,
  });

  revalidatePath(`/projects/${project.id}`);
  revalidatePath("/projects");
  revalidatePath("/");
  return { ok: true };
}
