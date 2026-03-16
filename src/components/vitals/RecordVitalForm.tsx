"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { VitalCreateSchema, VITAL_DEFAULT_UNITS, VitalTypeValues, type VitalCreateInput, type VitalType } from "@/lib/schemas/vital.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface RecordVitalFormProps {
  onSubmit: (payload: VitalCreateInput) => Promise<void>;
}

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
    resolver: zodResolver(VitalCreateSchema) as any,
    defaultValues: {
      vitalType: "BLOOD_PRESSURE",
      unit: VITAL_DEFAULT_UNITS.BLOOD_PRESSURE,
      readingValue: { systolic: 0, diastolic: 0 } as any,
      notes: "",
    },
  });

  const type = watch("vitalType") as VitalType;

  useEffect(() => {
    setValue("unit", VITAL_DEFAULT_UNITS[type], { shouldValidate: true });
  }, [setValue, type]);

  function handleTypeChange(typeValue: VitalType) {
    reset({
      vitalType: typeValue,
      unit: VITAL_DEFAULT_UNITS[typeValue],
      readingValue: (typeValue === "BLOOD_PRESSURE"
        ? { systolic: 0, diastolic: 0 }
        : { value: 0 }) as any,
      notes: "",
    });
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-2">
        <Label htmlFor="vitalType">Vital type</Label>
        <Select
          id="vitalType"
          value={type}
          onChange={(event) => handleTypeChange(event.target.value as VitalType)}
        >
          {VitalTypeValues.map((vitalType) => (
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
              {...register("readingValue.systolic" as any, { valueAsNumber: true })}
            />
            {(errors as any)?.readingValue?.systolic ? (
              <p className="text-sm text-destructive">{(errors as any).readingValue.systolic.message}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="diastolic">Diastolic ({VITAL_DEFAULT_UNITS.BLOOD_PRESSURE})</Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              {...register("readingValue.diastolic" as any, { valueAsNumber: true })}
            />
            {(errors as any)?.readingValue?.diastolic ? (
              <p className="text-sm text-destructive">{(errors as any).readingValue.diastolic.message}</p>
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
            {...register("readingValue.value" as any, { valueAsNumber: true })}
          />
          {(errors as any)?.readingValue?.value ? (
            <p className="text-sm text-destructive">{(errors as any).readingValue.value.message}</p>
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
