import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle, CardMark } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRoleRow } from "@/components/settings/user-row";
import { requireUser } from "@/server/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { asc } from "drizzle-orm";
import { getAllowlist } from "@/lib/allowlist";
import { UserCog, ShieldCheck } from "lucide-react";

export const metadata = {
  title: `Settings — ${APP_NAME}`,
  description: "Profile, role management, and admin tools.",
};

const ROLE_LABEL: Record<string, string> = {
  ceo: "CEO",
  designer: "Designer",
  viewer: "Viewer",
};

const ROLE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal"
> = {
  ceo: "signal",
  designer: "blueprint",
  viewer: "outline",
};

export default async function SettingsPage() {
  const me = await requireUser();
  const isCeo = me.role === "ceo";

  const allUsers = isCeo
    ? await db.select().from(users).orderBy(asc(users.name)).catch(() => [])
    : [];

  const allowlist = getAllowlist();

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-ink" />
          <span className="mono-caps text-ink-3">Section 03 · Settings</span>
        </div>
        <h1 className="display text-[clamp(40px,5vw,56px)] leading-[1.02] text-ink">
          Settings
        </h1>
        <p className="font-display text-[18px] text-ink-2 max-w-2xl">
          Your profile{isCeo ? " and team administration" : ""}.
        </p>
      </header>

      <Card>
        <CardMark>§ 01</CardMark>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-3.5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-y-3 gap-x-6 text-[13px]">
            <dt className="mono-caps text-ink-3 self-baseline">Name</dt>
            <dd className="font-display text-[20px] text-ink">{me.name}</dd>

            <dt className="mono-caps text-ink-3 self-baseline">Email</dt>
            <dd className="font-mono text-[13px] text-ink">{me.email}</dd>

            <dt className="mono-caps text-ink-3 self-baseline">Role</dt>
            <dd>
              <Badge variant={ROLE_VARIANT[me.role] ?? "secondary"}>
                {ROLE_LABEL[me.role] ?? me.role}
              </Badge>
            </dd>
          </dl>
          <p className="mt-5 pt-3 border-t border-rule text-[11px] text-ink-3 leading-snug">
            Roles are managed by the CEO. To change your name or email, contact
            the CEO.
          </p>
        </CardContent>
      </Card>

      {isCeo && (
        <>
          <Card>
            <CardMark>§ 02</CardMark>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="size-3.5" />
                Team & roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[12px] text-ink-3 leading-snug">
                Promote/demote team members. The last CEO cannot be demoted —
                promote another user first.
              </p>
              <div className="border-y border-rule divide-y divide-rule">
                {allUsers.map((u) => (
                  <UserRoleRow
                    key={u.id}
                    id={u.id}
                    name={u.name}
                    email={u.email}
                    role={u.role as "ceo" | "designer" | "viewer"}
                    isSelf={u.id === me.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardMark>§ 03</CardMark>
            <CardHeader>
              <CardTitle>Email allowlist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-[12px] text-ink-3 leading-snug">
                Only these emails can request a magic link. To edit, change the
                <code className="font-mono text-[11px] bg-paper-3 px-1 py-0.5 border border-rule mx-1">
                  EMAIL_ALLOWLIST
                </code>
                env var and redeploy. New allowlisted sign-ins are auto-provisioned
                as Viewer; promote them above.
              </p>
              <ul className="border-y border-rule divide-y divide-rule">
                {allowlist.length === 0 ? (
                  <li className="px-3 py-3 text-[13px] text-alert">
                    No emails in EMAIL_ALLOWLIST — no one can log in.
                  </li>
                ) : (
                  allowlist.map((email, i) => (
                    <li
                      key={email}
                      className="px-3 py-2.5 grid grid-cols-[auto_1fr] gap-3 items-baseline"
                    >
                      <span className="font-mono text-[10px] text-ink-3 tabular">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-mono text-[13px] text-ink">
                        {email}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
