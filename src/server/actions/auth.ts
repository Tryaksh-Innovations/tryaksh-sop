"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/**
 * Sign-out is still a server action because it needs to mutate cookies and
 * redirect — both fine for server actions. Magic-link issuance moved to a
 * route handler at /api/auth/magic-link to avoid action-ID mismatches.
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      logger.error("Supabase signOut failed", { error: error.message });
    }
  } catch (err) {
    logger.error("signOut crashed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  redirect("/login");
}
