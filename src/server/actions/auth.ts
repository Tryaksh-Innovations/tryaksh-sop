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
  try {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      return { ok: false, error: "Email is required." };
    }

    if (!isEmailAllowed(normalized)) {
      logger.warn("Magic link denied — email not in allowlist", {
        email: normalized,
      });
      // Deliberately vague so we don't leak the allowlist contents.
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
      logger.error("Supabase signInWithOtp failed", {
        email: normalized,
        error: error.message,
      });
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    // Any unexpected throw (network blip, timeout, cookie issue) ends up here.
    // We log it and return a friendly retry message rather than letting React
    // surface "Unexpected end of JSON input" to the user.
    logger.error("requestMagicLink crashed", {
      email,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      ok: false,
      error:
        "We couldn't reach the auth service. This usually clears in a few seconds — please try again.",
    };
  }
}

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
