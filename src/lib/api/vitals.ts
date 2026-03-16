import { apiClient } from "@/lib/api/client";
import type { VitalCreateInput, VitalType } from "@/lib/schemas/vital.schema";

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export interface SingleValue {
  value: number;
}

export interface VitalReading {
  id: string;
  vitalType: VitalType;
  unit: string;
  readingValue: BloodPressureValue | SingleValue;
  isAnomalous: boolean;
  notes?: string | null;
  recordedAt: string;
  recordedByName?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function getVitals(
  orgId: string,
  patientId: string,
  vitalType: VitalType,
  page = 0,
  size = 20,
): Promise<PaginatedResponse<VitalReading>> {
  const query = new URLSearchParams({
    vitalType,
    page: String(page),
    size: String(size),
  });

  return apiClient<PaginatedResponse<VitalReading>>(
    `/api/v1/organizations/${orgId}/patients/${patientId}/vitals?${query.toString()}`,
  );
}

export async function recordVital(
  orgId: string,
  patientId: string,
  payload: VitalCreateInput,
): Promise<VitalReading> {
  return apiClient<VitalReading>(
    `/api/v1/organizations/${orgId}/patients/${patientId}/vitals`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}
