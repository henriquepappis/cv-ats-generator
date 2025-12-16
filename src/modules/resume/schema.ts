import { z } from "zod";

export const ResumeSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  linkedin: z.string().optional(),
  summary: z.string().optional(),
  skills: z.record(z.array(z.string())).optional(),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        github: z.string().url().optional(),
        url: z.string().url().optional(),
        technologies: z.array(z.string()).optional()
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        position: z.string().optional(),
        company: z.string().optional(),
        location: z.string().optional(),
        period: z.string().optional(),
        achievements: z.array(z.string()).optional()
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string().optional(),
        institution: z.string().optional(),
        completion: z.string().optional()
      })
    )
    .optional()
});

export type ResumeInput = z.infer<typeof ResumeSchema>;
