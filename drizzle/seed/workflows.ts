/**
 * Seed: Workflows
 *
 * Creates the base workflow records that stages belong to. Idempotent —
 * existing rows are skipped via onConflictDoNothing on the slug.
 */

import { db } from "../../src/db";
import { workflows } from "../../src/db/schema";
import { logger } from "../../src/lib/logger";
import { eq } from "drizzle-orm";

interface WorkflowSeed {
  slug: string;
  name: string;
  version: string;
  description: string;
}

const ALL_WORKFLOWS: WorkflowSeed[] = [
  {
    slug: "pcb",
    name: "PCB Design Workflow",
    version: "2.0",
    description:
      "Standard 10-stage PCB design workflow from parts selection to production handoff. Schematic lock at Stage 6; proceed/reopen decision gate at Stage 8.",
  },
  {
    slug: "mech",
    name: "Mechanical Design Workflow",
    version: "2.0",
    description:
      "Standard 11-stage mechanical design workflow with Datum Lock at Stage 2 and DFM Review at Stage 7. First-article inspection at Stage 10; functional validation at Stage 11.",
  },
];

async function ensureWorkflow(seed: WorkflowSeed) {
  const [created] = await db
    .insert(workflows)
    .values({ ...seed, isActive: true })
    .onConflictDoNothing({ target: workflows.slug })
    .returning();

  if (created) {
    logger.info(`Created workflow: ${seed.slug}`, { id: created.id });
    return created;
  }
  logger.info(`Workflow ${seed.slug} already exists, fetching id.`);
  const [existing] = await db
    .select()
    .from(workflows)
    .where(eq(workflows.slug, seed.slug))
    .limit(1);
  return existing ?? null;
}

export async function seedWorkflows() {
  logger.info("Seeding workflows...");

  const results: Record<string, Awaited<ReturnType<typeof ensureWorkflow>>> = {};
  for (const wf of ALL_WORKFLOWS) {
    results[wf.slug] = await ensureWorkflow(wf);
  }

  return {
    pcb: results.pcb,
    mech: results.mech,
  };
}
