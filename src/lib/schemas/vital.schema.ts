import { z } from "zod";

export const VitalTypeValues = [
  "BLOOD_PRESSURE",
  "BLOOD_SUGAR",
  "SPO2",
  "TEMPERATURE",
  "HEART_RATE",
  "WEIGHT",
] as const;

export type VitalType = (typeof VitalTypeValues)[number];

export const VITAL_DEFAULT_UNITS: Record<VitalType, string> = {
  BLOOD_PRESSURE: "mmHg",
  BLOOD_SUGAR: "mg/dL",
  SPO2: "%",
  TEMPERATURE: "degC",
  HEART_RATE: "bpm",
  WEIGHT: "kg",
};

const BloodPressureReadingSchema = z.object({
  systolic: z.number().min(40, "Systolic is required"),
  diastolic: z.number().min(30, "Diastolic is required"),
});

const SingleValueReadingSchema = z.object({
  value: z.number(),
});

export const VitalCreateSchema = z.discriminatedUnion("vitalType", [
  z.object({
    vitalType: z.literal("BLOOD_PRESSURE"),
    unit: z.string().min(1),
    readingValue: BloodPressureReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    vitalType: z.literal("BLOOD_SUGAR"),
    unit: z.string().min(1),
    readingValue: SingleValueReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    vitalType: z.literal("SPO2"),
    unit: z.string().min(1),
    readingValue: SingleValueReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    vitalType: z.literal("TEMPERATURE"),
    unit: z.string().min(1),
    readingValue: SingleValueReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    vitalType: z.literal("HEART_RATE"),
    unit: z.string().min(1),
    readingValue: SingleValueReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    vitalType: z.literal("WEIGHT"),
    unit: z.string().min(1),
    readingValue: SingleValueReadingSchema,
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional().or(z.literal("")),
  }),
]);

export type VitalCreateInput = z.infer<typeof VitalCreateSchema>;
