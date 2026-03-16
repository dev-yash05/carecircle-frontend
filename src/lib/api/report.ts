import { ApiError } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getFilenameFromDisposition(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) return fallback;

  const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];

  return fallback;
}

export async function downloadMonthlyReport(orgId: string, patientId: string, month: string): Promise<void> {
  const query = new URLSearchParams({ month }).toString();
  const endpoint = `/api/v1/organizations/${orgId}/patients/${patientId}/report?${query}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/pdf,application/octet-stream",
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "Unable to download report");
    throw new ApiError(response.status, body || "Unable to download report");
  }

  const blob = await response.blob();
  const defaultFilename = `health-report-${month}.pdf`;
  const filename = getFilenameFromDisposition(response.headers.get("content-disposition"), defaultFilename);

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}
