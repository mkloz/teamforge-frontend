import { z } from "zod";
import { reportCategorySchema } from "./report.schemas";

export const reportFormSchema = z.object({
  targetKey: z.string().min(1),
  category: reportCategorySchema.nullable().refine(Boolean, {
    message: "Choose one reason.",
  }),
  description: z.string().trim().max(2000, "Keep this under 2,000 characters."),
  immediateSafety: z.boolean(),
  blockRequested: z.boolean(),
  leaveRequested: z.boolean(),
});

export type ReportFormValues = z.infer<typeof reportFormSchema>;
