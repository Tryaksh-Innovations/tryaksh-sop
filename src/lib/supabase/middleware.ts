import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth middleware — refreshes the session on every protected-route request
 * and redirects unauthenticated users to /login. Public paths (login, auth
 * callback) are bypassed entirely to avoid hitting Supabase from the edge
 * runtime when it's cold — which would otherwise stall server actions called
 * from /login and surface as "Unexpected end of JSON input" on the client.
 */

const PUBLIC_PATHS = [
  "/login",
  "/verify",
  "/auth/callback",
  "/api/auth", // route handlers used during sign-in
];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public paths: pass through with no Supabase call from the edge.
  // The server action on /login uses its own Supabase server client.
  if (isPublic(pathname)) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // IMPORTANT: this call refreshes the auth token cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch {
    // Supabase unreachable / cold-start timeout / cookie failure: fail open
    // by letting the request through. The page-level requireUser() guard
    // will catch unauthenticated users and redirect them to /login with a
    // clearer error than a stalled response.
    return supabaseResponse;
  }
}
