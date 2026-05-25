import { z } from "zod";

export const upsertChecklistResponseSchema = z
  .object({
    stageRunId: z.string().uuid(),
    checklistItemId: z.string().uuid(),
    state: z.enum(["unchecked", "checked", "na"]),
    initials: z
      .string()
      .trim()
      .max(8, "Initials are too long")
      .optional()
      .nullable(),
    naReason: z
      .string()
      .trim()
      .max(500, "Reason is too long")
      .optional()
      .nullable(),
  })
  .refine(
    (v) =>
      v.state !== "checked" ||
      (typeof v.initials === "string" && v.initials.trim().length > 0),
    {
      message: "Initials are required when ticking an item.",
      path: ["initials"],
    }
  )
  .refine(
    (v) =>
      v.state !== "na" ||
      (typeof v.naReason === "string" && v.naReason.trim().length > 0),
    {
      message: "A reason is required when marking N/A.",
      path: ["naReason"],
    }
  );

export type UpsertChecklistResponseInput = z.infer<
  typeof upsertChecklistResponseSchema
>;

export const addExternalLinkSchema = z.object({
  stageRunId: z.string().uuid(),
  kind: z.enum(["drive", "git", "datasheet", "image", "other"]),
  label: z.string().trim().min(1, "Label is required").max(120),
  url: z.string().trim().url("Must be a valid URL").max(2000),
});

export type AddExternalLinkInput = z.infer<typeof addExternalLinkSchema>;

export const removeExternalLinkSchema = z.object({
  linkId: z.string().uuid(),
});

export const updateStageNotesSchema = z.object({
  stageRunId: z.string().uuid(),
  notesMarkdown: z.string().max(10000),
});

export const requestApprovalSchema = z.object({
  stageRunId: z.string().uuid(),
});

export const approveStageSchema = z.object({
  stageRunId: z.string().uuid(),
  typedName: z
    .string()
    .trim()
    .min(2, "Type your full name to confirm")
    .max(120),
  note: z.string().trim().max(2000).optional().nullable(),
});

export type ApproveStageInput = z.infer<typeof approveStageSchema>;

export const sendBackSchema = z.object({
  stageRunId: z.string().uuid(),
  note: z
    .string()
    .trim()
    .min(2, "Provide a reason so the designer knows what to fix")
    .max(2000),
});

export const decideStage8Schema = z
  .object({
    stageRunId: z.string().uuid(),
    decision: z.enum(["proceed", "reopen"]),
    typedName: z
      .string()
      .trim()
      .min(2, "Type your full name to confirm")
      .max(120),
    note: z.string().trim().max(2000).optional().nullable(),
  })
  .refine(
    (v) =>
      v.decision !== "reopen" ||
      (typeof v.note === "string" && v.note.length >= 10),
    {
      message:
        "Reopening the schematic requires a written root-cause explanation (≥10 chars).",
      path: ["note"],
    }
  );

export type DecideStage8Input = z.infer<typeof decideStage8Schema>;
