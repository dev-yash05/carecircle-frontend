import { z } from "zod";

export const CRON_PRESETS = [
  { label: "Once daily - 8 AM", value: "0 0 8 * * ?" },
  { label: "Once daily - 8 PM", value: "0 0 20 * * ?" },
  { label: "Twice daily - 8 AM & 8 PM", value: "0 0 8,20 * * ?" },
  { label: "Every 6 hours", value: "0 0 0/6 * * ?" },
  { label: "Every 8 hours", value: "0 0 0/8 * * ?" },
  { label: "Every 12 hours", value: "0 0 0/12 * * ?" },
  { label: "Weekdays - 9 AM", value: "0 0 9 ? * MON-FRI" },
  { label: "Monday, Wednesday, Friday - 8 AM", value: "0 0 8 ? * MON,WED,FRI" },
  { label: "Weekly - Monday 8 AM", value: "0 0 8 ? * MON" },
  { label: "Monthly - 1st day 8 AM", value: "0 0 8 1 * ?" },
] as const;

export const CUSTOM_CRON_VALUE = "CUSTOM";

const MedicationFields = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  dosage: z.string().min(1, "Dosage is required"),
  schedule: z
    .string()
    .min(1, "Schedule is required")
    .regex(/^\S+(\s+\S+){5,6}$/, "Enter a valid CRON expression"),
  timezone: z.string().min(1, "Timezone is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  instructions: z.string().max(500, "Instructions cannot exceed 500 characters").optional().or(z.literal("")),
} as const;

export const MedicationFormSchema = z
  .object(MedicationFields)
  .refine((value) => {
    if (!value.endDate) return true;
    return value.endDate >= value.startDate;
  }, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export const MedicationCreateSchema = z
  .object({
    ...MedicationFields,
    patientId: z.string().min(1),
  })
  .refine((value) => {
    if (!value.endDate) return true;
    return value.endDate >= value.startDate;
  }, {
    message: "End date must be on or after start date",
    path: ["endDate"],
  });

export type MedicationFormInput = z.infer<typeof MedicationFormSchema>;
export type MedicationCreateInput = z.infer<typeof MedicationCreateSchema>;
