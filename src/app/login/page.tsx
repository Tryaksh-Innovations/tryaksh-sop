"use client";

import { useState } from "react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      let payload: { ok?: boolean; error?: string } = {};
      try {
        payload = await res.json();
      } catch {
        throw new Error(
          `Server returned ${res.status} with a non-JSON body. Refresh the page and try again.`
        );
      }

      if (res.ok && payload.ok) {
        // Auth cookies set by the server. Redirect to the dashboard.
        window.location.href = "/";
        return;
      }

      setStatus("error");
      setErrorMessage(
        payload.error ?? `Sign-in failed (HTTP ${res.status}).`
      );
    } catch (err) {
      setStatus("error");
      const msg = err instanceof Error ? err.message : String(err);
      const looksLikeNetwork =
        /unexpected end of json|fetch|network|timeout|503|502/i.test(msg);
      setErrorMessage(
        looksLikeNetwork
          ? "The auth service is waking up. Please wait a few seconds and try again."
          : msg
      );
    }
  }

  return (
    <div className="min-h-screen bg-paper">
      {/* Classification banner */}
      <div className="border-b border-rule-3 bg-ink text-paper">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 px-5 py-1.5">
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            <span>TRYAKSH-SOP-PCB-001</span>
            <span className="text-paper/60">·</span>
            <span>v2.0</span>
            <span className="text-paper/60">·</span>
            <span className="text-signal">STATUS: CONTROLLED</span>
          </div>
          <div className="hidden md:block font-mono text-[10px] uppercase tracking-[0.18em] text-paper/60">
            Internal · Authorised personnel only
          </div>
        </div>
      </div>

      <div className="grid min-h-[calc(100vh-1.875rem)] grid-cols-1 lg:grid-cols-[1fr_minmax(420px,440px)]">
        {/* ── Left: document cover ────────────────────────────── */}
        <div className="relative flex flex-col justify-between p-8 lg:p-14 border-r border-rule">
          <CornerMark className="top-4 left-4" />
          <CornerMark className="top-4 right-4" />
          <CornerMark className="bottom-4 left-4" />
          <CornerMark className="bottom-4 right-4" />

          <div className="flex items-center justify-between gap-4">
            <div className="mono-caps text-ink-3">Tryaksh Innovations Pvt. Ltd.</div>
            <div className="mono-caps text-ink-3">Issue · Edition 02</div>
          </div>

          <div className="max-w-2xl">
            <Image
              src="/tryaksh-logo.png"
              alt="Tryaksh"
              width={1024}
              height={768}
              priority
              className="h-20 md:h-24 w-auto mb-8 select-none dark:invert"
            />
            <div className="mono-caps text-signal-ink mb-4">
              Procedure · Engineering
            </div>
            <h1 className="display text-[clamp(48px,8vw,96px)] leading-[0.95] text-ink">
              The PCB
              <br />
              <em className="not-italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
                <span className="italic">Design</span>
              </em>{" "}
              SOP.
            </h1>
            <p className="mt-8 max-w-md font-display text-[20px] leading-snug text-ink-2">
              The ten-stage workflow with breadboard validation —
              parts selection, schematic lock at Stage 6, decision gate at
              Stage 8.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-md">
              <Stat n="10" label="Stages" />
              <Stat n="79" label="Checks" />
              <Stat n="02" label="Lock gates" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="h-px bg-rule-3" />
            <div className="flex flex-wrap items-center justify-between gap-4 mono-caps text-ink-3">
              <span>Owner: CEO, Tryaksh Innovations</span>
              <span>Tool of record: KiCad 8.x</span>
              <span>See: TRYAKSH-STD-ENG-001</span>
            </div>
          </div>
        </div>

        {/* ── Right: sign-in form ─────────────────────────────── */}
        <div className="flex items-center justify-center p-8 lg:p-12 bg-paper-2">
          <div className="w-full max-w-sm">
            <div className="mono-caps text-ink-3 mb-3">Access</div>
            <div className="h-px bg-rule-3 mb-6" />
            <h2 className="display text-[36px] leading-tight text-ink mb-1">
              Sign in
            </h2>
            <p className="text-[14px] text-ink-2 mb-8">
              Sign in with your Tryaksh email and password. Only allowlisted
              users may access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mono-caps text-ink-2 block mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@tryakshipl.com"
                  required
                  autoComplete="username"
                  className="w-full bg-transparent border-0 border-b border-rule-2 px-0 py-2 text-[18px] font-display text-ink placeholder:text-ink-4 focus:outline-none focus:border-ink transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mono-caps text-ink-2 block mb-2"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  className="w-full bg-transparent border-0 border-b border-rule-2 px-0 py-2 text-[18px] font-mono text-ink placeholder:text-ink-4 focus:outline-none focus:border-ink transition-colors tracking-widest"
                />
              </div>

              {status === "error" && (
                <div className="border border-alert-ink/40 bg-alert-soft p-3">
                  <div className="mono-caps text-alert-ink mb-1">Denied</div>
                  <p className="text-[12px] text-ink-2">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="group w-full h-11 bg-ink text-paper font-mono text-[12px] uppercase tracking-[0.18em] hover:bg-ink-2 transition-colors disabled:opacity-60 flex items-center justify-center gap-3"
              >
                {status === "loading" ? (
                  <>
                    <span className="size-1.5 bg-signal rounded-full animate-pulse" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign in
                    <span className="text-signal">→</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-5 border-t border-rule">
              <div className="mono-caps text-ink-4 mb-2">Footnote</div>
              <p className="text-[11px] text-ink-3 leading-relaxed">
                Don&apos;t have a password yet? Contact the CEO to be added.
                All sign-ins are logged in the audit trail per Engineering
                Standards §7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CornerMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-3 ${className ?? ""}`}
    >
      <span className="absolute inset-x-0 top-0 h-px bg-ink-3" />
      <span className="absolute inset-y-0 left-0 w-px bg-ink-3" />
    </span>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="border-t border-rule-3 pt-2">
      <div className="font-display text-[32px] leading-none text-ink">{n}</div>
      <div className="mt-1 mono-caps text-ink-3">{label}</div>
    </div>
  );
}
