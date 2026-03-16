import { apiClient } from "@/lib/api/client";
import type { PatientCreateInput, PatientUpdateInput } from "@/lib/schemas/patient.schema";

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  bloodGroup?: string | null;
  allergies?: string[] | null;
  notes?: string | null;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function getPatients(
  orgId: string,
  page = 0,
  size = 20,
  search = ""
): Promise<PaginatedResponse<Patient>> {
  const query = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    query.set("search", search.trim());
  }

  return apiClient<PaginatedResponse<Patient>>(
    `/api/v1/organizations/${orgId}/patients?${query.toString()}`
  );
}

export async function getPatient(orgId: string, patientId: string): Promise<Patient> {
  return apiClient<Patient>(`/api/v1/organizations/${orgId}/patients/${patientId}`);
}

export async function createPatient(
  orgId: string,
  payload: PatientCreateInput
): Promise<Patient> {
  return apiClient<Patient>(`/api/v1/organizations/${orgId}/patients`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updatePatient(
  orgId: string,
  patientId: string,
  payload: PatientUpdateInput
): Promise<Patient> {
  return apiClient<Patient>(`/api/v1/organizations/${orgId}/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
