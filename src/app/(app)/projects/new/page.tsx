import Link from "next/link";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardMark } from "@/components/ui/card";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { requireUser } from "@/server/auth";
import { listDesigners } from "@/server/queries/projects";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: `New project — ${APP_NAME}`,
  description: "Create a new PCB design project.",
};

export default async function NewProjectPage() {
  const user = await requireUser();
  if (user.role !== "ceo") {
    redirect("/projects");
  }

  const designers = await listDesigners().catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to register
      </Link>

      <header className="border-t border-rule-3 pt-6">
        <span className="mono-caps text-signal-ink">Issue · New entry</span>
        <h1 className="display text-[clamp(36px,5vw,52px)] leading-[1.02] text-ink mt-2">
          Open a new project
        </h1>
        <p className="mt-3 font-display text-[16px] text-ink-2 max-w-xl">
          A project starts at{" "}
          <span className="text-ink">Stage 1 — Parts Selection</span>. Assign
          the designer now; promote/reassign later if needed.
        </p>
      </header>

      <Card>
        <CardMark>§ A</CardMark>
        <CardContent className="py-6">
          <CreateProjectForm designers={designers} />
        </CardContent>
      </Card>
    </div>
  );
}
