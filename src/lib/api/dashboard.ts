import { ApiError, apiClient } from "@/lib/api/client";

export interface DashboardPendingDose {
  id: string;
  patientId: string;
  patientName?: string;
  medicationName: string;
  dosage: string;
  scheduledAt: string;
  status: "PENDING" | "TAKEN" | "SKIPPED" | "MISSED";
}

export interface DashboardSummary {
  pendingDoses: DashboardPendingDose[];
}

interface DashboardPayload {
  [key: string]: unknown;
}

type DashboardApiPayload = DashboardPayload | DashboardPayload[];

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizePendingDose(raw: Record<string, unknown>): DashboardPendingDose {
  return {
    id: String(pickFirst(raw.id, raw.doseEventId, raw.dose_event_id) ?? ""),
    patientId: String(pickFirst(raw.patientId, raw.patient_id) ?? ""),
    patientName: pickFirst(raw.patientName, raw.patient_name) as string | undefined,
    medicationName: String(pickFirst(raw.medicationName, raw.medication_name, raw.medication) ?? "Medication"),
    dosage: String(pickFirst(raw.dosage, raw.dose) ?? "-"),
    scheduledAt: String(pickFirst(raw.scheduledAt, raw.scheduled_at, raw.time) ?? ""),
    status: String(pickFirst(raw.status, "PENDING")) as DashboardPendingDose["status"],
  };
}

export async function getDashboardSummary(orgId: string): Promise<DashboardSummary> {
  const endpoints = [
    `/api/v1/organizations/${orgId}/dashboard`,
    `/api/v1/organizations/${orgId}/dashboard/summary`,
    `/api/v1/organizations/${orgId}/doses/pending`,
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await apiClient<DashboardApiPayload>(endpoint);
      return normalizeSummary(data);
    } catch (error) {
      if (error instanceof ApiError && [404, 405, 501].includes(error.status)) {
        continue;
      }
      throw error;
    }
  }

  return { pendingDoses: [] };
}

function normalizeSummary(data: DashboardApiPayload): DashboardSummary {
  if (Array.isArray(data)) {
    return {
      pendingDoses: data.map((item) => normalizePendingDose(item as Record<string, unknown>)),
    };
  }

  const pendingRaw = pickFirst(
    data.pendingDoses,
    data.pending_doses,
    data.pending,
  );

  const pendingDoses = Array.isArray(pendingRaw)
    ? pendingRaw.map((item) => normalizePendingDose(item as Record<string, unknown>))
    : [];

  return { pendingDoses };
}
