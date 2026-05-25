/**
 * Email allowlist — defines who is permitted to request a magic link.
 *
 * Source of truth: EMAIL_ALLOWLIST env var (comma-separated, case-insensitive).
 * If unset, no one can sign in — fail closed.
 */

function getAllowedEmails(): Set<string> {
  const raw = process.env.EMAIL_ALLOWLIST ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isEmailAllowed(email: string): boolean {
  const allowed = getAllowedEmails();
  return allowed.has(email.trim().toLowerCase());
}

export function getAllowlist(): string[] {
  return Array.from(getAllowedEmails());
}
