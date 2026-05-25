"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addExternalLink, removeExternalLink } from "@/server/actions/workflow";
import {
  AlertCircle,
  ExternalLink as LinkIcon,
  Plus,
  Trash2,
  HardDrive,
  GitBranch,
  FileText,
  Image as ImageIcon,
  Link2,
} from "lucide-react";

type LinkKind = "drive" | "git" | "datasheet" | "image" | "other";

const KIND_ICON: Record<LinkKind, React.ElementType> = {
  drive: HardDrive,
  git: GitBranch,
  datasheet: FileText,
  image: ImageIcon,
  other: Link2,
};

const KIND_LABEL: Record<LinkKind, string> = {
  drive: "Drive",
  git: "Git",
  datasheet: "Datasheet",
  image: "Image",
  other: "Other",
};

interface LinkRow {
  id: string;
  kind: LinkKind;
  label: string;
  url: string;
  addedByName: string;
  addedAt: Date;
  canRemove: boolean;
}

interface ExternalLinksPanelProps {
  stageRunId: string;
  links: LinkRow[];
  canAdd: boolean;
}

export function ExternalLinksPanel({
  stageRunId,
  links,
  canAdd,
}: ExternalLinksPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [kind, setKind] = useState<LinkKind>("drive");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await addExternalLink({
        stageRunId,
        kind,
        label: label.trim(),
        url: url.trim(),
      });
      if (result.ok) {
        setLabel("");
        setUrl("");
        setShowForm(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function remove(linkId: string) {
    startTransition(async () => {
      const result = await removeExternalLink({ linkId });
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="space-y-3">
      {links.length === 0 ? (
        <p className="text-[12px] text-ink-3 leading-snug">
          No links yet. Attach the project Drive folder, Git tag, datasheet,
          or inspection photos.
        </p>
      ) : (
        <ul className="divide-y divide-rule border-y border-rule">
          {links.map((l) => {
            const Icon = KIND_ICON[l.kind];
            return (
              <li
                key={l.id}
                className="flex items-center gap-3 py-2.5 group"
              >
                <Icon className="size-3.5 shrink-0 text-ink-3" />
                <div className="min-w-0 flex-1">
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] font-medium text-ink hover:underline underline-offset-4 decoration-signal"
                  >
                    {l.label}
                    <LinkIcon className="size-2.5 opacity-50" />
                  </a>
                  <div className="mt-0.5 font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
                    {KIND_LABEL[l.kind]} · {l.addedByName}
                  </div>
                </div>
                {l.canRemove && (
                  <button
                    type="button"
                    onClick={() => remove(l.id)}
                    className="text-ink-3 hover:text-alert opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove link"
                    disabled={pending}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canAdd && (
        <>
          {showForm ? (
            <div className="space-y-3 border border-rule-2 bg-paper p-3">
              <div>
                <Label htmlFor="link-kind" className="block mb-1">
                  Kind
                </Label>
                <select
                  id="link-kind"
                  value={kind}
                  onChange={(e) => setKind(e.target.value as LinkKind)}
                  className="flex h-9 w-full rounded-none border-0 border-b border-rule-2 bg-transparent px-0 font-sans text-[13px] text-ink focus:outline-none focus:border-ink"
                >
                  {(Object.keys(KIND_LABEL) as LinkKind[]).map((k) => (
                    <option key={k} value={k}>
                      {KIND_LABEL[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="link-label" className="block mb-1">
                  Label
                </Label>
                <Input
                  id="link-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Schematic_V0.2 PDF"
                />
              </div>
              <div>
                <Label htmlFor="link-url" className="block mb-1">
                  URL
                </Label>
                <Input
                  id="link-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              {error && (
                <div className="flex items-start gap-2 border border-alert-ink/40 bg-alert-soft px-2 py-1.5 text-[11px]">
                  <AlertCircle className="mt-0.5 size-3 shrink-0 text-alert-ink" />
                  <span className="text-ink-2">{error}</span>
                </div>
              )}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setError(null);
                  }}
                  disabled={pending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={submit}
                  disabled={pending || !label.trim() || !url.trim()}
                >
                  {pending ? "Adding…" : "Add link"}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="size-3" />
              Add link
            </Button>
          )}
        </>
      )}
    </div>
  );
}
