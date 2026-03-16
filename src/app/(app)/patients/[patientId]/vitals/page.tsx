/// <reference types="react/canary" />
"use client";

import * as React from "react";
import { VitalsPanel } from "@/components/vitals/VitalsPanel";

export default function VitalsPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);

  return <VitalsPanel patientId={patientId} />;
}
