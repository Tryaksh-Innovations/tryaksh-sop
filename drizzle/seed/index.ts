/**
 * Seed runner — executes all seed files in order.
 *
 * Usage: npx tsx drizzle/seed/index.ts
 */

import { seedWorkflows } from "./workflows";
import { seedStages } from "./stages";
import { seedChecklistItems } from "./checklist-items";
import { seedUsers } from "./users";
import { logger } from "../../src/lib/logger";

async function main() {
  logger.info("=== Starting database seed ===");

  try {
    // 1. Seed users
    await seedUsers();

    // 2. Seed workflow
    const workflow = await seedWorkflows();
    if (!workflow) {
      logger.error("Failed to create or find PCB workflow. Aborting seed.");
      process.exit(1);
    }

    // 3. Seed stages
    await seedStages(workflow.id);

    // 4. Seed checklist items
    await seedChecklistItems(workflow.id);

    logger.info("=== Seed complete ===");
  } catch (error) {
    logger.error("Seed failed", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
