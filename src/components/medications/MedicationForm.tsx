"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleHelp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CRON_PRESETS,
  CUSTOM_CRON_VALUE,
  MedicationFormSchema,
  type MedicationFormInput,
} from "@/lib/schemas/medication.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const DEFAULT_TIMEZONE = "Asia/Kolkata";

function today() {
  return new Date().toISOString().slice(0, 10);
}

interface MedicationFormProps {
  onSubmit: (payload: MedicationFormInput) => Promise<void>;
}

export function MedicationForm({ onSubmit }: MedicationFormProps) {
  const [preset, setPreset] = useState<string>(CRON_PRESETS[0].value);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormInput>({
    resolver: zodResolver(MedicationFormSchema),
    defaultValues: {
      name: "",
      dosage: "",
      schedule: CRON_PRESETS[0].value,
      timezone: DEFAULT_TIMEZONE,
      startDate: today(),
      endDate: "",
      instructions: "",
    },
  });

  const schedule = watch("schedule");

  useEffect(() => {
    const matched = CRON_PRESETS.find((item) => item.value === schedule);
    setPreset(matched ? matched.value : CUSTOM_CRON_VALUE);
  }, [schedule]);

  const showCustomInput = useMemo(() => preset === CUSTOM_CRON_VALUE, [preset]);

  return (
    <form className="space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <div className="space-y-2">
        <Label htmlFor="name">Medication name</Label>
        <Input id="name" placeholder="Metformin" {...register("name")} />
        {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dosage">Dosage</Label>
        <Input id="dosage" placeholder="500 mg" {...register("dosage")} />
        {errors.dosage ? <p className="text-xs text-destructive">{errors.dosage.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="schedulePreset">Schedule</Label>
        <Select
          id="schedulePreset"
          value={preset}
          onChange={(event) => {
            const value = event.target.value;
            setPreset(value);
            if (value !== CUSTOM_CRON_VALUE) {
              setValue("schedule", value, { shouldValidate: true });
            }
          }}
        >
          {CRON_PRESETS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
          <option value={CUSTOM_CRON_VALUE}>Custom…</option>
        </Select>
      </div>

      {showCustomInput ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="schedule">CRON expression</Label>
            <a
              href="https://crontab.guru"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CircleHelp className="h-3.5 w-3.5" />
              Help
            </a>
          </div>
          <Input
            id="schedule"
            placeholder="0 0 8,20 * * ?"
            className="font-mono"
            {...register("schedule")}
          />
          {errors.schedule ? <p className="text-xs text-destructive">{errors.schedule.message}</p> : null}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            id="timezone"
            value={watch("timezone")}
            onChange={(event) => setValue("timezone", event.target.value as string, { shouldValidate: true })}
          >
            <option value="Asia/Kolkata">Asia/Kolkata</option>
            <option value="UTC">UTC</option>
            <option value="Asia/Dubai">Asia/Dubai</option>
            <option value="Europe/London">Europe/London</option>
          </Select>
          {errors.timezone ? <p className="text-xs text-destructive">{errors.timezone.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate ? <p className="text-xs text-destructive">{errors.startDate.message}</p> : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">End date (optional)</Label>
        <Input id="endDate" type="date" {...register("endDate")} />
        {errors.endDate ? <p className="text-xs text-destructive">{errors.endDate.message}</p> : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions (optional)</Label>
        <Textarea id="instructions" rows={3} placeholder="After food" {...register("instructions")} />
        {errors.instructions ? <p className="text-xs text-destructive">{errors.instructions.message}</p> : null}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Add medication"}
        </Button>
      </div>
    </form>
  );
}
