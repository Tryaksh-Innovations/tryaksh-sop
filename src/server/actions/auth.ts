"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/allowlist";
import { logger } from "@/lib/logger";

export type RequestMagicLinkResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestMagicLink(
  email: string
): Promise<RequestMagicLinkResult> {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return { ok: false, error: "Email is required." };
  }

  if (!isEmailAllowed(normalized)) {
    logger.warn("Magic link denied — email not in allowlist", {
      email: normalized,
    });
    // Same response shape as success on the client side, but with error here:
    // we deliberately do NOT leak the allowlist contents to clients.
    return {
      ok: false,
      error:
        "This email is not authorized to sign in. Contact your administrator.",
    };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    logger.error("Supabase signInWithOtp failed", { email: normalized, error });
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    logger.error("Supabase signOut failed", { error });
  }
  redirect("/login");
}

