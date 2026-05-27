import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isEmailAllowed } from "@/lib/allowlist";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/sign-in
 * Body: { email: string, password: string }
 *
 * Plain JSON in/out. Validates email is allowlisted, then calls
 * Supabase signInWithPassword. On success, the SSR client sets
 * auth cookies on the response automatically.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const maxDuration = 30;

interface Body {
  email?: unknown;
  password?: unknown;
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
  const rawPassword = body.password;

  if (typeof rawEmail !== "string" || !rawEmail.trim()) {
    return json(400, { ok: false, error: "Email is required." });
  }
  if (typeof rawPassword !== "string" || !rawPassword) {
    return json(400, { ok: false, error: "Password is required." });
  }

  const normalized = rawEmail.trim().toLowerCase();

  if (!isEmailAllowed(normalized)) {
    logger.warn("Sign-in denied — email not in allowlist", {
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
    const { error } = await supabase.auth.signInWithPassword({
      email: normalized,
      password: rawPassword,
    });

    if (error) {
      logger.warn("Supabase signInWithPassword failed", {
        email: normalized,
        error: error.message,
      });

      const msg = error.message;
      let friendly = msg;
      if (/invalid login credentials/i.test(msg)) {
        friendly = "Wrong email or password. Check both and try again.";
      } else if (/email not confirmed/i.test(msg)) {
        friendly =
          "Your account email is not confirmed. Ask the admin to confirm you in Supabase.";
      } else if (/unexpected token.*doctype|html/i.test(msg)) {
        friendly =
          "Auth service is unreachable right now. Try again in a moment.";
      } else if (/rate limit|too many requests|429/i.test(msg)) {
        friendly =
          "Too many sign-in attempts. Wait a few minutes and try again.";
      }

      return json(401, { ok: false, error: friendly });
    }

    return json(200, { ok: true });
  } catch (err) {
    logger.error("sign-in route crashed", {
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
