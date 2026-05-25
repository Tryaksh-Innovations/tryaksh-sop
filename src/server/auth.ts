/**
 * Server-side auth helpers — session retrieval and role checks.
 *
 * The Supabase auth user (auth.users.id) is the source of truth for sessions.
 * Our app's public.users table stores roles & display data and is matched by email.
 * IDs in public.users are stable app-internal UUIDs used in all FKs.
 */

import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isEmailAllowed } from "@/lib/allowlist";
import { logger } from "@/lib/logger";
import type { UserRole } from "@/types";

export type AppUser = typeof users.$inferSelect;

/**
 * Get the current authenticated user with their app-level role.
 * Returns null if not signed in (does NOT redirect — leaves that to callers).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) return null;

  // Block immediately if the signed-in email is no longer in the allowlist
  // (a user could have been provisioned, then removed from EMAIL_ALLOWLIST).
  if (!isEmailAllowed(authUser.email)) {
    logger.warn("Signed-in user not in allowlist; rejecting", {
      email: authUser.email,
    });
    await supabase.auth.signOut();
    return null;
  }

  const normalizedEmail = authUser.email.toLowerCase();

  const [existing] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${normalizedEmail}`)
    .limit(1);

  if (existing) {
    return existing;
  }

  // Allowlisted user signed in but no public.users record — provision a
  // default-viewer entry so they can at least see the handbook. Promotion
  // to designer/ceo is done by an existing CEO in Settings.
  logger.info("Provisioning new public.users row for allowlisted signin", {
    email: normalizedEmail,
  });
  const [created] = await db
    .insert(users)
    .values({
      email: normalizedEmail,
      name: authUser.user_metadata?.name ?? authUser.email,
      role: "viewer",
    })
    .returning();

  return created ?? null;
}

/**
 * Get the current user OR redirect to /login if not signed in.
 */
export async function requireUser(): Promise<AppUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Require a specific role. Redirects to /login if not signed in;
 * throws if signed in but lacking the role.
 */
export async function requireRole(...allowedRoles: UserRole[]): Promise<AppUser> {
  const user = await requireUser();
  if (!allowedRoles.includes(user.role as UserRole)) {
    throw new Error(
      `Access denied. Required role: ${allowedRoles.join(" or ")}. Your role: ${user.role}`
    );
  }
  return user;
}

export async function hasRole(...roles: UserRole[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  return roles.includes(user.role as UserRole);
}
