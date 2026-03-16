/// <reference types="react/canary" />
"use client";

import * as React from "react";
import { DoseTimeline } from "@/components/doses/DoseTimeline";

export default function DosesPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);

  return <DoseTimeline patientId={patientId} />;
}
