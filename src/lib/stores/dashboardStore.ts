import { create } from "zustand";
import type { DashboardMessage } from "@/lib/hooks/useWebSocket";

export interface DashboardAnomaly {
  id: string;
  patientId: string;
  patientName: string;
  anomalyType: string;
  timestamp: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  patientId?: string;
  patientName?: string;
  label: string;
  timestamp: string;
}

interface DashboardState {
  anomalies: DashboardAnomaly[];
  activity: ActivityItem[];
  handleMessage: (message: DashboardMessage) => void;
  dismissAnomaly: (id: string) => void;
}

function safeTimestamp(value?: string) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : value;
}

function isAnomalyType(type: string) {
  return type.includes("ANOMALY");
}

function activityLabel(message: DashboardMessage) {
  const payload = message.payload ?? {};
  if (message.type === "DOSE_MARKED") {
    return `${payload.medicationName ?? "Medication"} marked as taken`;
  }
  if (message.type === "DOSE_MISSED") {
    return `${payload.medicationName ?? "Medication"} was missed`;
  }
  if (message.type === "VITAL_RECORDED") {
    return `${String(payload.vitalType ?? "Vital").toLowerCase().replaceAll("_", " ")} recorded`;
  }
  if (isAnomalyType(message.type)) {
    return `${payload.anomalyType ?? "Anomalous reading"} detected`;
  }
  return String(payload.message ?? "Dashboard activity updated");
}

function anomalyFromMessage(message: DashboardMessage): DashboardAnomaly | null {
  if (!isAnomalyType(message.type)) return null;

  const payload = message.payload ?? {};
  const id = String(payload.id ?? payload.eventId ?? `${message.type}-${payload.patientId ?? "unknown"}-${message.timestamp ?? Date.now()}`);
  return {
    id,
    patientId: String(payload.patientId ?? ""),
    patientName: String(payload.patientName ?? "A patient"),
    anomalyType: String(payload.anomalyType ?? message.type),
    timestamp: safeTimestamp(message.timestamp),
  };
}

export const useDashboardStore = create<DashboardState>((set) => ({
  anomalies: [],
  activity: [],
  handleMessage: (message) => {
    const anomaly = anomalyFromMessage(message);
    const payload = message.payload ?? {};

    const nextActivity: ActivityItem = {
      id: String(payload.id ?? payload.eventId ?? `${message.type}-${Date.now()}-${Math.random()}`),
      type: message.type,
      patientId: payload.patientId ? String(payload.patientId) : undefined,
      patientName: payload.patientName ? String(payload.patientName) : undefined,
      label: activityLabel(message),
      timestamp: safeTimestamp(message.timestamp),
    };

    set((state) => ({
      anomalies: anomaly
        ? [anomaly, ...state.anomalies.filter((item) => item.id !== anomaly.id)]
        : state.anomalies,
      activity: [nextActivity, ...state.activity].slice(0, 20),
    }));
  },
  dismissAnomaly: (id) => {
    set((state) => ({
      anomalies: state.anomalies.filter((item) => item.id !== id),
    }));
  },
}));
