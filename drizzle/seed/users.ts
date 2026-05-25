/**
 * Seed: Initial Users
 *
 * Creates the allowlisted users in the public.users table.
 * These must match the emails in Supabase Auth.
 */

import { db } from "../../src/db";
import { users } from "../../src/db/schema";
import { logger } from "../../src/lib/logger";

interface UserSeed {
  email: string;
  name: string;
  role: "ceo" | "designer" | "viewer";
}

const SEED_USERS: UserSeed[] = [
  {
    email: "ceo@tryakshipl.com",
    name: "Richansh",
    role: "ceo",
  },
  {
    email: "pde@tryakshipl.com",
    name: "PDE",
    role: "designer",
  },
];

export async function seedUsers() {
  logger.info("Seeding users...");

  for (const user of SEED_USERS) {
    const [created] = await db
      .insert(users)
      .values(user)
      .onConflictDoNothing({ target: users.email })
      .returning();

    if (created) {
      logger.info(`  Created user: ${user.email} (${user.role})`, {
        id: created.id,
      });
    } else {
      logger.info(`  User ${user.email} already exists, skipping.`);
    }
  }

  logger.info(`Seeded ${SEED_USERS.length} users.`);
}
