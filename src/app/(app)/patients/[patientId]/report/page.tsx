"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { downloadMonthlyReport } from "@/lib/api/report";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toaster";

function formatMonthForInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getLastMonthValue() {
  const now = new Date();
  return formatMonthForInput(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

function getMinMonthValue() {
  const now = new Date();
  return formatMonthForInput(new Date(now.getFullYear() - 2, now.getMonth(), 1));
}

function getMaxMonthValue() {
  return formatMonthForInput(new Date());
}

function prettyMonth(month: string) {
  const [year, monthPart] = month.split("-");
  const parsed = new Date(Number(year), Number(monthPart) - 1, 1);
  if (Number.isNaN(parsed.getTime())) return "Selected";
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function ReportPage({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const { patientId } = React.use(params);
  const [month, setMonth] = React.useState(getLastMonthValue);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const orgId = useAuthStore((state) => state.user?.organizationId ?? undefined);
  const { toast } = useToast();

  async function handleDownload() {
    if (!orgId) {
      toast.error("Missing organization context");
      return;
    }

    try {
      setIsDownloading(true);
      await downloadMonthlyReport(orgId, patientId, month);
      toast.success("Report downloaded", {
        description: `Health report for ${prettyMonth(month)} saved to your device`,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        toast.warning("No data for this period");
        return;
      }

      toast.error("Download failed", {
        description: error instanceof Error ? error.message : "Unable to generate report",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl">Monthly Health Report</CardTitle>
              <CardDescription>PDF summary of doses, vitals, and anomalies</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-month">Month</Label>
            <Input
              id="report-month"
              type="month"
              value={month}
              min={getMinMonthValue()}
              max={getMaxMonthValue()}
              onChange={(event) => setMonth(event.target.value)}
            />
          </div>

          <Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isDownloading ? "Generating report..." : `Download ${prettyMonth(month)} report`}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-secondary/40">
        <CardHeader className="pb-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Report includes</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Medication adherence summary</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Missed and skipped dose trends</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Vitals and key readings</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Detected anomalies and alerts</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-primary" />Activity timeline highlights</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
