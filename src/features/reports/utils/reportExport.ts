import { toast } from "sonner";
import { reportService, type CreateReportPayload } from "@/core/services/report.service";
import {
  downloadAuthenticatedFile,
  isReportFileReady,
  verifyReportFileExists,
} from "@/features/reports/utils/reportFiles";
import type { ReportPreviewModel } from "@/features/reports/utils/reportPreview";
import { openReportPrintWindow } from "@/features/reports/utils/reportPrintWindow";
import { renderReportPrintHtml } from "@/features/reports/utils/renderReportPrintHtml";
import { FetchError } from "@/lib/fetchClient";

export const registerReportOnServer = async (payload: CreateReportPayload) => {
  return reportService.createReport(payload);
};

export type ExportReportResult =
  | { mode: "pdf-print" }
  | { mode: "server-pdf"; reportId: number }
  | { mode: "server-registered" };

export const exportReport = async (input: {
  reportName: string;
  reportType: string;
  parameters: Record<string, unknown>;
  preview: ReportPreviewModel;
  preferServerPdf?: boolean;
}): Promise<ExportReportResult> => {
  const { reportName, reportType, parameters, preview, preferServerPdf = true } = input;

  const bodyHtml = renderReportPrintHtml(preview);
  const printed = openReportPrintWindow(reportName, bodyHtml);

  if (!printed) {
    throw new Error("No se pudo abrir la ventana de impresión.");
  }

  if (!preferServerPdf) {
    return { mode: "pdf-print" };
  }

  try {
    const created = await registerReportOnServer({
      name: reportName,
      type: reportType,
      parameters,
    });

    const finalized = await reportService.pollUntilFileReady(created.id, {
      maxAttempts: 3,
      intervalMs: 1500,
    });

    if (isReportFileReady(finalized.file_url)) {
      const exists = await verifyReportFileExists(finalized.file_url!);
      if (exists) {
        await downloadAuthenticatedFile(
          finalized.file_url!,
          `${sanitizeFilename(reportName)}.pdf`
        );
        return { mode: "server-pdf", reportId: finalized.id };
      }
    }

    return { mode: "server-registered" };
  } catch (error) {
    if (error instanceof FetchError && error.status === 403) {
      toast.message(
        "Informe descargado desde la vista previa. Su rol no puede registrar reportes en el servidor (se requiere Directivo)."
      );
      return { mode: "pdf-print" };
    }

    throw error;
  }
};

const sanitizeFilename = (value: string) =>
  value.replace(/[^\w\s-áéíóúñ]/gi, "").trim() || "informe";
