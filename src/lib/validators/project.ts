import { z } from "zod";

export const projectCodeSchema = z
  .string()
  .trim()
  .min(3, "Project code must be at least 3 characters")
  .max(40, "Project code is too long")
  .regex(
    /^[A-Z0-9-]+$/,
    "Project code may only contain uppercase letters, digits, and hyphens"
  );

export const createProjectSchema = z.object({
  code: projectCodeSchema,
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  designClass: z.enum(["A", "B", "C"], {
    message: "Pick a design class",
  }),
  designerId: z.string().uuid("Pick a designer"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectStatusSchema = z.object({
  projectId: z.string().uuid(),
  status: z.enum(["in_progress", "on_hold", "completed", "archived"]),
});

export type UpdateProjectStatusInput = z.infer<typeof updateProjectStatusSchema>;
