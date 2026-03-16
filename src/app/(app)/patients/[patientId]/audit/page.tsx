"use client";

import * as React from "react";
import { AuditLogTable } from "@/components/audit/AuditLogTable";

export default function AuditPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);

  return <AuditLogTable patientId={patientId} />;
}
