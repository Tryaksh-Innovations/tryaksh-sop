import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/allowlist";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/magic-link
 * Body: { email: string }
 *
 * Plain JSON in/out — no server-action machinery, no action ID hashing,
 * no edge cache surprises. This is the reliable path for issuing a
 * magic link from the login page.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  email?: unknown;
}

function json(
  status: number,
  body: { ok: boolean; error?: string }
): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "CDN-Cache-Control": "no-store",
      "Vercel-CDN-Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(400, { ok: false, error: "Invalid request body." });
  }

  const rawEmail = body.email;
  if (typeof rawEmail !== "string" || !rawEmail.trim()) {
    return json(400, { ok: false, error: "Email is required." });
  }
  const normalized = rawEmail.trim().toLowerCase();

  if (!isEmailAllowed(normalized)) {
    logger.warn("Magic link denied — email not in allowlist", {
      email: normalized,
    });
    return json(403, {
      ok: false,
      error:
        "This email is not authorized to sign in. Contact your administrator.",
    });
  }

  try {
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
        status: (error as { status?: number }).status,
      });

      // Translate cryptic Supabase errors into actionable messages.
      const msg = error.message;
      let friendly = msg;
      if (/unexpected token.*doctype|html/i.test(msg)) {
        friendly =
          "Supabase auth service is unreachable or rate-limiting. Wait a minute and try again; if it persists, check the Supabase dashboard for project status.";
      } else if (/rate limit|too many requests|429/i.test(msg)) {
        friendly =
          "Too many sign-in requests for this email. Wait a few minutes and try again.";
      } else if (/email.*invalid|invalid.*email/i.test(msg)) {
        friendly = "That email address is not valid.";
      }

      return json(502, { ok: false, error: friendly });
    }

    return json(200, { ok: true });
  } catch (err) {
    logger.error("magic-link route crashed", {
      email: normalized,
      error: err instanceof Error ? err.message : String(err),
    });
    return json(503, {
      ok: false,
      error:
        "Auth service is unavailable. Please try again in a few seconds.",
    });
  }
}
