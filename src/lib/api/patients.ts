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

interface BackendPatient {
  [key: string]: unknown;
}

type BackendPatientList = PaginatedResponse<BackendPatient> | BackendPatient[];

function pickFirst<T>(...values: Array<T | null | undefined>): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
}

function normalizeAllergies(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  return null;
}

function toPatient(raw: BackendPatient): Patient {
  const source = (raw.patient as Record<string, unknown> | undefined) ?? raw;

  const metadataRaw = pickFirst(source.metadata, raw.metadata);
  const metadata = typeof metadataRaw === "string"
    ? (() => {
        try {
          return JSON.parse(metadataRaw) as Record<string, unknown>;
        } catch {
          return {};
        }
      })()
    : ((metadataRaw as Record<string, unknown> | undefined) ?? {});

  const medicalInfo = (source.medicalInfo as Record<string, unknown> | undefined) ??
    (source.medical as Record<string, unknown> | undefined) ??
    {};

  const bloodGroup = pickFirst(
    raw.bloodGroup as string | null | undefined,
    raw.blood_type as string | null | undefined,
    raw.bloodType as string | null | undefined,
    source.bloodGroup as string | null | undefined,
    source.blood_type as string | null | undefined,
    source.bloodType as string | null | undefined,
    medicalInfo.bloodGroup as string | null | undefined,
    medicalInfo.blood_type as string | null | undefined,
    medicalInfo.bloodType as string | null | undefined,
    metadata.bloodGroup as string | null | undefined,
    metadata.blood_type as string | null | undefined,
    metadata.bloodType as string | null | undefined,
  );

  const allergies = normalizeAllergies(
    pickFirst(
      raw.allergies,
      raw.allergyList,
      raw.allergy_list,
      source.allergies,
      source.allergyList,
      source.allergy_list,
      medicalInfo.allergies,
      medicalInfo.allergyList,
      medicalInfo.allergy_list,
      metadata.allergies,
      metadata.allergyList,
      metadata.allergy_list,
    ),
  );

  const notes = pickFirst(
    raw.notes as string | null | undefined,
    raw.medicalNotes as string | null | undefined,
    raw.medical_notes as string | null | undefined,
    source.notes as string | null | undefined,
    source.medicalNotes as string | null | undefined,
    source.medical_notes as string | null | undefined,
    medicalInfo.notes as string | null | undefined,
    medicalInfo.medicalNotes as string | null | undefined,
    medicalInfo.medical_notes as string | null | undefined,
    metadata.notes as string | null | undefined,
    metadata.note as string | null | undefined,
    metadata.medicalNotes as string | null | undefined,
    metadata.medical_notes as string | null | undefined,
  );

  return {
    id: String(pickFirst(raw.id, raw.patientId, raw.patient_id, source.id, source.patientId, source.patient_id) ?? ""),
    name: String(pickFirst(raw.fullName, raw.full_name, raw.name, source.fullName, source.full_name, source.name) ?? ""),
    dateOfBirth: String(pickFirst(raw.dateOfBirth, raw.date_of_birth, raw.dob, source.dateOfBirth, source.date_of_birth, source.dob) ?? ""),
    bloodGroup: bloodGroup ?? null,
    allergies,
    notes: notes ?? null,
  };
}

function toBackendPatientPayload(payload: PatientCreateInput | PatientUpdateInput) {
  const name = payload.name?.trim();
  const dateOfBirth = payload.dateOfBirth;
  const bloodGroup = payload.bloodGroup;
  const allergies = payload.allergies?.map((item) => item.trim()).filter(Boolean);
  const notes = payload.notes?.trim();

  return {
    ...(name ? { fullName: name, full_name: name, name } : {}),
    ...(dateOfBirth ? { dateOfBirth, date_of_birth: dateOfBirth, dob: dateOfBirth } : {}),
    ...(bloodGroup ? { bloodGroup, bloodType: bloodGroup, blood_type: bloodGroup } : {}),
    ...(allergies && allergies.length > 0
      ? { allergies, allergyList: allergies, allergy_list: allergies }
      : {}),
    ...(notes ? { notes, medicalNotes: notes, medical_notes: notes } : {}),
    medicalInfo: {
      ...(bloodGroup ? { bloodGroup, bloodType: bloodGroup, blood_type: bloodGroup } : {}),
      ...(allergies && allergies.length > 0
        ? { allergies, allergyList: allergies, allergy_list: allergies }
        : {}),
      ...(notes ? { notes, medicalNotes: notes, medical_notes: notes } : {}),
    },
    metadata: {
      ...(bloodGroup ? { blood_type: bloodGroup, bloodType: bloodGroup } : {}),
      ...(allergies && allergies.length > 0
        ? { allergies, allergy_list: allergies }
        : {}),
      ...(notes ? { notes } : {}),
    },
  };
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

  const data = await apiClient<BackendPatientList>(
    `/api/v1/organizations/${orgId}/patients?${query.toString()}`
  );

  if (Array.isArray(data)) {
    return {
      content: data.map(toPatient),
      totalElements: data.length,
      totalPages: 1,
      number: 0,
      size: data.length,
    };
  }

  return {
    ...data,
    content: data.content.map(toPatient),
  };
}

export async function getPatient(orgId: string, patientId: string): Promise<Patient> {
  const data = await apiClient<BackendPatient>(`/api/v1/organizations/${orgId}/patients/${patientId}`);
  return toPatient(data);
}

export async function createPatient(
  orgId: string,
  payload: PatientCreateInput
): Promise<Patient> {
  const data = await apiClient<BackendPatient>(`/api/v1/organizations/${orgId}/patients`, {
    method: "POST",
    body: JSON.stringify(toBackendPatientPayload(payload)),
  });
  return toPatient(data);
}

export async function updatePatient(
  orgId: string,
  patientId: string,
  payload: PatientUpdateInput
): Promise<Patient> {
  const data = await apiClient<BackendPatient>(`/api/v1/organizations/${orgId}/patients/${patientId}`, {
    method: "PUT",
    body: JSON.stringify(toBackendPatientPayload(payload)),
  });
  return toPatient(data);
}
