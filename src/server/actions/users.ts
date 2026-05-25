"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/server/auth";

const changeUserRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["ceo", "designer", "viewer"]),
});

export type ChangeUserRoleResult =
  | { ok: true }
  | { ok: false; error: string };

export async function changeUserRole(
  raw: unknown
): Promise<ChangeUserRoleResult> {
  const actor = await requireRole("ceo");

  const parsed = changeUserRoleSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }
  const { userId, role } = parsed.data;

  const [target] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!target) return { ok: false, error: "User not found." };
  if (target.role === role) return { ok: true };

  // Don't allow removing the last CEO.
  if (target.role === "ceo" && role !== "ceo") {
    const ceos = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "ceo"));
    if (ceos.length <= 1) {
      return {
        ok: false,
        error:
          "Cannot demote the last CEO. Promote another user to CEO first.",
      };
    }
  }

  const before = { role: target.role, email: target.email };
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

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
    action: "user_role_changed",
    entityType: "users",
    entityId: userId,
    beforeJson: before,
    afterJson: { role, email: target.email },
    ipAddress,
    userAgent,
  });

  revalidatePath("/settings");
  revalidatePath("/audit");
  return { ok: true };
}
