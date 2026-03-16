import { ApiError, apiClient } from "@/lib/api/client";
import type { MedicationCreateInput } from "@/lib/schemas/medication.schema";

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  cronExpression: string;
  timezone: string;
  startDate: string;
  endDate?: string | null;
  instructions?: string | null;
  active: boolean;
}

interface MedicationPayload {
  [key: string]: unknown;
}

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function toMedication(raw: MedicationPayload): Medication {
  return {
    id: String(pickFirst(raw.id, raw.medicationId, raw.medication_id) ?? ""),
    patientId: String(pickFirst(raw.patientId, raw.patient_id) ?? ""),
    name: String(pickFirst(raw.name, raw.medicationName, raw.medication_name) ?? "Medication"),
    dosage: String(pickFirst(raw.dosage, raw.dose, raw.strength) ?? "-"),
    cronExpression: String(pickFirst(raw.cronExpression, raw.cron_expression, raw.schedule, raw.cron) ?? ""),
    timezone: String(pickFirst(raw.timezone, "Asia/Kolkata")),
    startDate: String(pickFirst(raw.startDate, raw.start_date) ?? ""),
    endDate: (pickFirst(raw.endDate, raw.end_date) as string | null | undefined) ?? null,
    instructions: (pickFirst(raw.instructions, raw.notes) as string | null | undefined) ?? null,
    active: Boolean(pickFirst(raw.active, true)),
  };
}

export async function getMedications(orgId: string, patientId: string): Promise<Medication[]> {
  const data = await apiClient<MedicationPayload[] | { content?: MedicationPayload[] }>(
    `/api/v1/organizations/${orgId}/patients/${patientId}/medications`,
  );

  const list = Array.isArray(data) ? data : (data.content ?? []);
  return list.map((item) => toMedication(item)).filter((item) => item.active);
}

export async function createMedication(orgId: string, payload: MedicationCreateInput): Promise<Medication> {
  const data = await apiClient<MedicationPayload>(`/api/v1/organizations/${orgId}/medications`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return toMedication(data);
}

export async function deactivateMedication(orgId: string, medicationId: string): Promise<void> {
  const endpoints = [
    { path: `/api/v1/organizations/${orgId}/medications/${medicationId}/deactivate`, method: "POST" },
    { path: `/api/v1/organizations/${orgId}/medications/${medicationId}/deactivate`, method: "PUT" },
    { path: `/api/v1/organizations/${orgId}/medications/${medicationId}`, method: "DELETE" },
  ] as const;

  for (const endpoint of endpoints) {
    try {
      await apiClient<void>(endpoint.path, { method: endpoint.method });
      return;
    } catch (error) {
      if (error instanceof ApiError && [404, 405].includes(error.status)) {
        continue;
      }
      throw error;
    }
  }
}
