/**
 * Seed runner — executes all seed files in order, for all workflows.
 *
 * Usage: npx tsx --env-file=.env.local drizzle/seed/index.ts
 */

import { seedWorkflows } from "./workflows";
import { seedStages } from "./stages";
import { seedChecklistItems } from "./checklist-items";
import { seedMechStages } from "./mech-stages";
import { seedMechChecklistItems } from "./mech-checklist-items";
import { seedUsers } from "./users";
import { logger } from "../../src/lib/logger";

async function main() {
  logger.info("=== Starting database seed ===");

  try {
    // 1. Seed users
    await seedUsers();

    // 2. Seed workflows (PCB + Mechanical)
    const wf = await seedWorkflows();
    logger.info("Workflows seeded", {
      pcbId: wf.pcb?.id ?? "MISSING",
      mechId: wf.mech?.id ?? "MISSING",
    });

    // 3. PCB workflow content
    if (wf.pcb?.id) {
      await seedStages(wf.pcb.id);
      await seedChecklistItems(wf.pcb.id);
    } else {
      logger.error("PCB workflow id missing — skipping PCB content seed.");
    }

    // 4. Mechanical workflow content
    if (wf.mech?.id) {
      await seedMechStages(wf.mech.id);
      await seedMechChecklistItems(wf.mech.id);
    } else {
      logger.error(
        "Mechanical workflow id missing — skipping mech content seed."
      );
    }

    logger.info("=== Seed complete ===");
  } catch (error) {
    logger.error("Seed failed", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
