import { z } from "zod";

export const MemberRoleValues = ["CAREGIVER", "VIEWER"] as const;

export const MemberAddSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  role: z.enum(MemberRoleValues),
});

export type MemberAddInput = z.infer<typeof MemberAddSchema>;
