"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BloodGroupValues,
  PatientCreateSchema,
  PatientUpdateSchema,
  type PatientCreateInput,
} from "@/lib/schemas/patient.schema";

type FormMode = "create" | "edit";

interface PatientFormProps {
  mode: FormMode;
  initialValues?: Partial<PatientCreateInput>;
  submitLabel?: string;
  onSubmit: (payload: PatientCreateInput) => Promise<void> | void;
}

export function PatientForm({
  mode,
  initialValues,
  submitLabel = mode === "create" ? "Create patient" : "Save changes",
  onSubmit,
}: PatientFormProps) {
  const schema = mode === "create" ? PatientCreateSchema : PatientUpdateSchema;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientCreateInput>({
    resolver: zodResolver(schema) as Resolver<PatientCreateInput>,
    defaultValues: {
      name: "",
      dateOfBirth: "",
      bloodGroup: undefined,
      notes: "",
      allergies: [],
    },
  });

  useEffect(() => {
    if (!initialValues) return;
    if (initialValues.name) setValue("name", initialValues.name);
    if (initialValues.dateOfBirth) setValue("dateOfBirth", initialValues.dateOfBirth.slice(0, 10));
    if (initialValues.bloodGroup) setValue("bloodGroup", initialValues.bloodGroup as PatientCreateInput["bloodGroup"]);
    if (initialValues.notes) setValue("notes", initialValues.notes);
    if (initialValues.allergies) setValue("allergies", initialValues.allergies);
  }, [initialValues, setValue]);

  const allergyInput = (watch("allergies") ?? []).join(", ");

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="e.g. Meera Sharma" {...register("name")} />
        {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of birth</Label>
        <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
        {errors.dateOfBirth ? <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bloodGroup">Blood group</Label>
        <Select
          id="bloodGroup"
          value={watch("bloodGroup") ?? ""}
          onChange={(event) => {
            const value = event.target.value as PatientCreateInput["bloodGroup"] | "";
            setValue("bloodGroup", value || undefined, { shouldValidate: true });
          }}
        >
          <option value="">Select blood group</option>
          {BloodGroupValues.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies (comma separated)</Label>
        <Input
          id="allergies"
          value={allergyInput}
          onChange={(event) => {
            const next = event.target.value
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean);
            setValue("allergies", next, { shouldValidate: true });
          }}
          placeholder="e.g. Penicillin, Peanuts"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={4} placeholder="Anything the care team should know" {...register("notes")} />
        {errors.notes ? <p className="text-sm text-destructive">{errors.notes.message}</p> : null}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
