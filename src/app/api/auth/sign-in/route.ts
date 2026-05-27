import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isEmailAllowed } from "@/lib/allowlist";
import { logger } from "@/lib/logger";

/**
 * POST /api/auth/sign-in
 * Body: { email: string, password: string }
 *
 * Uses raw fetch against Supabase's REST endpoint instead of the SDK,
 * with browser-shaped headers. This bypasses the Cloudflare bot
 * heuristics that were rejecting the SDK's calls from Vercel
 * serverless functions with an HTML challenge page.
 *
 * On success, we set the session via the SSR client which writes the
 * auth cookies — same end state as if signInWithPassword had worked.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const runtime = "nodejs";
export const maxDuration = 30;
// Run in a region close to the Supabase project (ap-southeast-2 / Sydney).
// Singapore is the closest Vercel region; reduces latency and looks less
// like cross-continent bot traffic to Supabase's Cloudflare layer.
export const preferredRegion = ["sin1", "syd1", "bom1", "iad1"];

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

function friendlyMessage(rawMsg: string, status: number): string {
  if (/invalid login credentials|invalid_credentials/i.test(rawMsg)) {
    return "Wrong email or password. Check both and try again.";
  }
  if (/email not confirmed|email_not_confirmed/i.test(rawMsg)) {
    return "Your account email is not confirmed. Open the user in Supabase Dashboard → Auth → Users and confirm the email.";
  }
  if (/rate limit|too many requests|over_request_rate|429/i.test(rawMsg)) {
    return "Too many sign-in attempts. Wait a few minutes and try again.";
  }
  if (/unexpected token.*doctype|html|<!doctype/i.test(rawMsg)) {
    return "Auth service is unreachable right now. Try again in a moment.";
  }
  return rawMsg || `Sign-in failed (HTTP ${status}).`;
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    logger.error("Supabase env vars missing", null, {
      hasUrl: !!supabaseUrl,
      hasKey: !!anonKey,
    });
    return json(503, { ok: false, error: "Auth service misconfigured." });
  }

  // ── Raw fetch to Supabase's password-grant endpoint ─────────
  // Browser-shaped headers to look like a normal client, not a bot.
  let authRes: Response;
  try {
    authRes = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apikey: anonKey,
          // Looks like a normal browser to Supabase's Cloudflare layer.
          "User-Agent":
            "Mozilla/5.0 (compatible; TryakshSOP/1.0; +https://sop.tryakshipl.com)",
        },
        body: JSON.stringify({ email: normalized, password: rawPassword }),
      }
    );
  } catch (err) {
    logger.error("Network error reaching Supabase", err, {
      email: normalized,
    });
    return json(503, {
      ok: false,
      error: "Could not reach auth service. Please try again.",
    });
  }

  const bodyText = await authRes.text();
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    logger.error("Supabase returned non-JSON response", null, {
      email: normalized,
      status: authRes.status,
      contentType: authRes.headers.get("content-type") ?? "",
      cfRay: authRes.headers.get("cf-ray") ?? "",
      bodyPreview: bodyText.substring(0, 300),
    });
    return json(503, {
      ok: false,
      error: "Auth service returned an unexpected response. Try again shortly.",
    });
  }

  if (!authRes.ok) {
    const rawMsg =
      (parsed?.msg as string) ||
      (parsed?.error_description as string) ||
      (parsed?.error as string) ||
      (parsed?.message as string) ||
      `HTTP ${authRes.status}`;
    logger.warn("Supabase auth rejected sign-in", {
      email: normalized,
      status: String(authRes.status),
      rawMsg,
    });
    return json(401, {
      ok: false,
      error: friendlyMessage(rawMsg, authRes.status),
    });
  }

  // Success — parsed has access_token, refresh_token, etc.
  const accessToken = parsed?.access_token as string | undefined;
  const refreshToken = parsed?.refresh_token as string | undefined;
  if (!accessToken || !refreshToken) {
    logger.error("Supabase auth ok but no tokens in response", null, {
      email: normalized,
      keys: parsed ? Object.keys(parsed).join(",") : "",
    });
    return json(502, {
      ok: false,
      error: "Auth service returned an unexpected success shape.",
    });
  }

  // ── Set the session cookies via the SSR client ──────────────
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, options);
            } catch {
              // ignore set errors during streaming
            }
          });
        },
      },
    });

    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  } catch (err) {
    logger.error("setSession failed after successful auth", err, {
      email: normalized,
    });
    return json(500, {
      ok: false,
      error: "Signed in with Supabase but session couldn't be saved. Try again.",
    });
  }

  return json(200, { ok: true });
}
