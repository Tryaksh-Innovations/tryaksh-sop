/**
 * Seed: PCB Design Workflow
 *
 * Creates the base workflow record that all stages belong to.
 */

import { db } from "../../src/db";
import { workflows } from "../../src/db/schema";
import { logger } from "../../src/lib/logger";

export async function seedWorkflows() {
  logger.info("Seeding workflows...");

  const [pcbWorkflow] = await db
    .insert(workflows)
    .values({
      slug: "pcb",
      name: "PCB Design Workflow",
      version: "2.0",
      description:
        "Standard 10-stage PCB design workflow from parts selection to production handoff.",
      isActive: true,
    })
    .onConflictDoNothing({ target: workflows.slug })
    .returning();

  if (pcbWorkflow) {
    logger.info("Created PCB workflow", { id: pcbWorkflow.id });
  } else {
    logger.info("PCB workflow already exists, skipping.");
  }

  return pcbWorkflow;
}
