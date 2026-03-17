import { ApiError, apiClient } from "@/lib/api/client";
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

const VITAL_TYPE_ALIASES: Record<VitalType, string[]> = {
  BLOOD_PRESSURE: ["BLOOD_PRESSURE"],
  BLOOD_SUGAR: ["BLOOD_SUGAR", "BLOOD_GLUCOSE", "GLUCOSE"],
  SPO2: ["SPO2", "OXYGEN_SATURATION", "SPO_2"],
  TEMPERATURE: ["TEMPERATURE", "BODY_TEMPERATURE"],
  HEART_RATE: ["HEART_RATE", "PULSE", "PULSE_RATE", "HEARTBEAT"],
  WEIGHT: ["WEIGHT", "BODY_WEIGHT"],
};

const SYNTHETIC_VITAL_CONFIG: Partial<Record<VitalType, { backendType: VitalType; marker: string }>> = {
  HEART_RATE: { backendType: "BLOOD_SUGAR", marker: "[CC_VITAL:HEART_RATE]" },
  WEIGHT: { backendType: "TEMPERATURE", marker: "[CC_VITAL:WEIGHT]" },
};

const SYNTHETIC_MARKERS = Object.values(SYNTHETIC_VITAL_CONFIG).map((item) => item.marker);

function shouldRetryInvalidVitalType(error: unknown) {
  return error instanceof ApiError
    && error.status === 400
    && /invalid vital type/i.test(error.message);
}

function toBackendVitalPayload(payload: Record<string, unknown>, vitalType: string): Record<string, unknown> {
  return {
    ...payload,
    vitalType,
    vital_type: vitalType,
  };
}

function prependMarker(notes: string | undefined, marker: string) {
  const body = notes?.trim() ?? "";
  return body ? `${marker} ${body}` : marker;
}

function hasMarker(notes: string | null | undefined, marker: string) {
  return typeof notes === "string" && notes.includes(marker);
}

function stripMarkers(notes: string | null | undefined) {
  if (!notes) return notes ?? null;
  let result = notes;
  SYNTHETIC_MARKERS.forEach((marker) => {
    result = result.replace(marker, "").trim();
  });
  return result || null;
}

function normalizeReading(reading: VitalReading, requestedType: VitalType): VitalReading {
  return {
    ...reading,
    vitalType: requestedType,
    notes: stripMarkers(reading.notes),
  };
}

function normalizePage(
  data: PaginatedResponse<VitalReading>,
  requestedType: VitalType,
  page: number,
  size: number,
): PaginatedResponse<VitalReading> {
  const synthetic = SYNTHETIC_VITAL_CONFIG[requestedType];

  const content = (data.content ?? [])
    .filter((reading) => {
      if (synthetic) {
        return hasMarker(reading.notes, synthetic.marker);
      }
      return !SYNTHETIC_MARKERS.some((marker) => hasMarker(reading.notes, marker));
    })
    .map((reading) => normalizeReading(reading, requestedType));

  return {
    content,
    totalElements: content.length,
    totalPages: content.length === 0 ? 1 : Math.ceil(content.length / (data.size || size || 1)),
    number: data.number ?? page,
    size: data.size ?? size,
  };
}

export async function getVitals(
  orgId: string,
  patientId: string,
  vitalType: VitalType,
  page = 0,
  size = 20,
): Promise<PaginatedResponse<VitalReading>> {
  const synthetic = SYNTHETIC_VITAL_CONFIG[vitalType];
  const backendType = synthetic?.backendType ?? vitalType;
  const candidates = VITAL_TYPE_ALIASES[backendType];

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    const query = new URLSearchParams({
      vitalType: candidate,
      page: String(page),
      size: String(size),
    });

    try {
      const data = await apiClient<PaginatedResponse<VitalReading>>(
        `/api/v1/organizations/${orgId}/patients/${patientId}/vitals?${query.toString()}`,
      );
      return normalizePage(data, vitalType, page, size);
    } catch (error) {
      const lastAttempt = index === candidates.length - 1;
      if (!lastAttempt && shouldRetryInvalidVitalType(error)) {
        continue;
      }
      throw error;
    }
  }

  return {
    content: [],
    totalElements: 0,
    totalPages: 1,
    number: page,
    size,
  };
}

export async function recordVital(
  orgId: string,
  patientId: string,
  payload: VitalCreateInput,
): Promise<VitalReading> {
  const synthetic = SYNTHETIC_VITAL_CONFIG[payload.vitalType];
  const backendType = synthetic?.backendType ?? payload.vitalType;
  const candidates = VITAL_TYPE_ALIASES[backendType];

  const payloadForBackend: Record<string, unknown> = synthetic
    ? {
        ...payload,
        vitalType: backendType,
        notes: prependMarker(payload.notes, synthetic.marker),
      }
    : payload;

  for (let index = 0; index < candidates.length; index += 1) {
    const candidate = candidates[index];
    try {
      const reading = await apiClient<VitalReading>(
        `/api/v1/organizations/${orgId}/patients/${patientId}/vitals`,
        {
          method: "POST",
          body: JSON.stringify(toBackendVitalPayload(payloadForBackend, candidate)),
        },
      );
      return normalizeReading(reading, payload.vitalType);
    } catch (error) {
      const lastAttempt = index === candidates.length - 1;
      if (!lastAttempt && shouldRetryInvalidVitalType(error)) {
        continue;
      }
      throw error;
    }
  }

  throw new ApiError(400, "Unable to record vital");
}
