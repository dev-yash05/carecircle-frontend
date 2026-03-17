"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { VitalCreateSchema, VITAL_DEFAULT_UNITS, type VitalCreateInput, type VitalType } from "@/lib/schemas/vital.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RecordVitalFormProps {
  onSubmit: (payload: VitalCreateInput) => Promise<void>;
}

type ReadingValueErrors = Partial<Record<"systolic" | "diastolic" | "value", { message?: string }>>;

const RECORDABLE_VITAL_TYPES: VitalType[] = [
  "BLOOD_PRESSURE",
  "BLOOD_SUGAR",
  "SPO2",
  "TEMPERATURE",
  "HEART_RATE",
  "WEIGHT",
];

const PLACEHOLDERS: Record<VitalType, string> = {
  BLOOD_PRESSURE: "120 / 80",
  BLOOD_SUGAR: "110",
  SPO2: "98",
  TEMPERATURE: "36.8",
  HEART_RATE: "72",
  WEIGHT: "65",
};

function friendlyType(type: VitalType) {
  if (type === "BLOOD_PRESSURE") return "Blood Pressure";
  if (type === "BLOOD_SUGAR") return "Blood Sugar";
  if (type === "SPO2") return "SpO2";
  if (type === "TEMPERATURE") return "Temperature";
  if (type === "HEART_RATE") return "Heart Rate";
  return "Weight";
}

export function RecordVitalForm({ onSubmit }: RecordVitalFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalCreateInput>({
    resolver: zodResolver(VitalCreateSchema) as Resolver<VitalCreateInput>,
    defaultValues: {
      vitalType: "BLOOD_PRESSURE",
      unit: VITAL_DEFAULT_UNITS.BLOOD_PRESSURE,
      readingValue: { systolic: 0, diastolic: 0 },
      notes: "",
    },
  });

  const type = watch("vitalType") as VitalType;

  useEffect(() => {
    setValue("unit", VITAL_DEFAULT_UNITS[type], { shouldValidate: true });
  }, [setValue, type]);

  function handleTypeChange(typeValue: VitalType) {
    const nextValues: VitalCreateInput = typeValue === "BLOOD_PRESSURE"
      ? {
          vitalType: "BLOOD_PRESSURE",
          unit: VITAL_DEFAULT_UNITS.BLOOD_PRESSURE,
          readingValue: { systolic: 0, diastolic: 0 },
          notes: "",
        }
      : {
          vitalType: typeValue,
          unit: VITAL_DEFAULT_UNITS[typeValue],
          readingValue: { value: 0 },
          notes: "",
        };

    reset({
      ...nextValues,
    });
  }

  const readingErrors = errors.readingValue as unknown as ReadingValueErrors | undefined;

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-2">
        <Label htmlFor="vitalType">Vital type</Label>
        <Select
          id="vitalType"
          value={type}
          onChange={(event) => handleTypeChange(event.target.value as VitalType)}
        >
          {RECORDABLE_VITAL_TYPES.map((vitalType) => (
            <option key={vitalType} value={vitalType}>
              {friendlyType(vitalType)}
            </option>
          ))}
        </Select>
      </div>

      {type === "BLOOD_PRESSURE" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="systolic">Systolic ({VITAL_DEFAULT_UNITS.BLOOD_PRESSURE})</Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              {...register("readingValue.systolic", { valueAsNumber: true })}
            />
            {readingErrors?.systolic?.message ? (
              <p className="text-sm text-destructive">{readingErrors.systolic.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic ({VITAL_DEFAULT_UNITS.BLOOD_PRESSURE})</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              {...register("readingValue.diastolic", { valueAsNumber: true })}
            />
            {readingErrors?.diastolic?.message ? (
              <p className="text-sm text-destructive">{readingErrors.diastolic.message}</p>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Label htmlFor="readingValue">
            {friendlyType(type)} ({VITAL_DEFAULT_UNITS[type]})
          </Label>
          <Input
            id="readingValue"
            type="number"
            step={type === "TEMPERATURE" ? "0.1" : "1"}
            placeholder={PLACEHOLDERS[type]}
            {...register("readingValue.value", { valueAsNumber: true })}
          />
          {readingErrors?.value?.message ? (
            <p className="text-sm text-destructive">{readingErrors.value.message}</p>
          ) : null}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={3} placeholder="Optional context" {...register("notes")} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Record vital"}
      </Button>
    </form>
  );
}
