"use client";

import type { DotProps } from "recharts";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BloodPressureValue, SingleValue, VitalReading } from "@/lib/api/vitals";
import type { VitalType } from "@/lib/schemas/vital.schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartPoint {
  recordedAt: string;
  label: string;
  primary: number;
  secondary?: number;
  isAnomalous: boolean;
}

interface VitalsChartProps {
  vitalType: VitalType;
  readings: VitalReading[];
  unit: string;
}

function extractChartValues(type: VitalType, reading: VitalReading) {
  const value = reading.readingValue;
  if (type === "BLOOD_PRESSURE") {
    const bloodPressure = value as BloodPressureValue;
    return { primary: bloodPressure.systolic, secondary: bloodPressure.diastolic };
  }
  const singleValue = value as SingleValue;
  return { primary: singleValue.value, secondary: undefined };
}

function chartTitle(type: VitalType) {
  if (type === "BLOOD_PRESSURE") return "Blood Pressure trend";
  if (type === "BLOOD_SUGAR") return "Blood Sugar trend";
  if (type === "SPO2") return "SpO2 trend";
  if (type === "TEMPERATURE") return "Temperature trend";
  if (type === "HEART_RATE") return "Heart Rate trend";
  return "Weight trend";
}

function friendlyType(type: VitalType) {
  if (type === "BLOOD_PRESSURE") return "Blood Pressure";
  if (type === "BLOOD_SUGAR") return "Blood Sugar";
  if (type === "SPO2") return "SpO2";
  if (type === "TEMPERATURE") return "Temperature";
  if (type === "HEART_RATE") return "Heart Rate";
  return "Weight";
}

function AnomalousDot(props: DotProps & { payload?: ChartPoint }) {
  if (!props.payload?.isAnomalous || props.cx == null || props.cy == null) return null;
  return (
    <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" stroke="#fecaca" strokeWidth={2} />
  );
}

function AnomalousDotSecondary(props: DotProps & { payload?: ChartPoint }) {
  if (!props.payload?.isAnomalous || props.cx == null || props.cy == null) return null;
  return (
    <circle cx={props.cx} cy={props.cy} r={5} fill="#ef4444" stroke="#fecaca" strokeWidth={2} />
  );
}

function formatValue(type: VitalType, point: ChartPoint) {
  if (type === "BLOOD_PRESSURE") {
    return `${point.primary}/${point.secondary ?? "-"}`;
  }
  return String(point.primary);
}

export function VitalsChart({ vitalType, readings, unit }: VitalsChartProps) {
  const data: ChartPoint[] = readings
    .map((r) => {
      const values = extractChartValues(vitalType, r);
      const date = new Date(r.recordedAt);
      return {
        recordedAt: r.recordedAt,
        label: Number.isNaN(date.getTime())
          ? "Unknown"
          : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        primary: values.primary,
        secondary: values.secondary,
        isAnomalous: r.isAnomalous,
      };
    })
    .reverse();

  const hasData = data.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{chartTitle(vitalType)}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-4">
            <div className="h-56">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data} margin={{ left: 4, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78716c", fontSize: 12 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#78716c", fontSize: 12 }}
                    tickFormatter={(value) => `${value} ${unit}`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const point = payload[0]?.payload as ChartPoint;
                      const dt = new Date(point.recordedAt);
                      const datetime = Number.isNaN(dt.getTime())
                        ? label
                        : dt.toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                      return (
                        <div className="rounded-md border bg-card p-3 shadow-md">
                          <p className="text-xs text-muted-foreground">{datetime}</p>
                          {vitalType === "BLOOD_PRESSURE" ? (
                            <>
                              <p className="text-sm" style={{ color: "#0d9488" }}>Systolic: {point.primary}</p>
                              <p className="text-sm" style={{ color: "#f59e0b" }}>Diastolic: {point.secondary}</p>
                            </>
                          ) : (
                            <p className="text-sm" style={{ color: "#0d9488" }}>
                              Value: {formatValue(vitalType, point)}
                            </p>
                          )}
                          {point.isAnomalous ? (
                            <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>⚠ Anomalous reading</p>
                          ) : null}
                        </div>
                      );
                    }}
                  />

                  {vitalType === "BLOOD_PRESSURE" ? (
                    <>
                      <ReferenceLine y={160} stroke="#ef4444" strokeDasharray="4 4" label="160" />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="4 4" label="100" />
                    </>
                  ) : null}

                  <Line
                    type="monotone"
                    dataKey="primary"
                    stroke="#0d9488"
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#0d9488" }}
                    activeDot={{ r: 4 }}
                    name="Primary"
                  />
                  <Line
                    type="monotone"
                    dataKey="primary"
                    stroke="transparent"
                    dot={<AnomalousDot />}
                    legendType="none"
                  />

                  {vitalType === "BLOOD_PRESSURE" ? (
                    <>
                      <Line
                        type="monotone"
                        dataKey="secondary"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#f59e0b" }}
                        activeDot={{ r: 4 }}
                        name="Secondary"
                      />
                      <Line
                        type="monotone"
                        dataKey="secondary"
                        stroke="transparent"
                        dot={<AnomalousDotSecondary />}
                        legendType="none"
                      />
                    </>
                  ) : null}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#0d9488" }} />Primary</span>
              {vitalType === "BLOOD_PRESSURE" ? (
                <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#f59e0b" }} />Diastolic</span>
              ) : null}
              <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "#ef4444" }} />Anomalous</span>
              <span className="inline-flex items-center gap-2"><span className="h-0.5 w-6" style={{ backgroundColor: "#ef4444", borderTop: "1px dashed #ef4444" }} />Threshold</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
            No {friendlyType(vitalType)} readings yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
