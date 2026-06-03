"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { ReportPrintDocument } from "@/features/reports/components/ReportPrintDocument";
import type { ReportPreviewModel } from "@/features/reports/utils/reportPreview";
import { REPORT_PRINT_STYLES } from "@/features/reports/utils/reportPrintStyles";
import { exportReport } from "@/features/reports/utils/reportExport";
import { FetchError } from "@/lib/fetchClient";

interface ExportReportPreviewModalProps {
  open: boolean;
  onClose: () => void;
  preview: ReportPreviewModel | null;
  reportName: string;
  reportType: string;
  reportParameters: Record<string, unknown>;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

export function ExportReportPreviewModal({
  open,
  onClose,
  preview,
  reportName,
  reportType,
  reportParameters,
}: ExportReportPreviewModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleClose = () => {
    setIsExporting(false);
    onClose();
  };

  const handleExport = async () => {
    if (!preview) return;

    setIsExporting(true);

    try {
      const result = await exportReport({
        reportName,
        reportType,
        parameters: reportParameters,
        preview,
      });

      if (result.mode === "server-pdf") {
        toast.success("Informe guardado y descargado desde el servidor.");
      } else if (result.mode === "server-registered") {
        toast.success(
          "PDF generado en una ventana nueva. El registro quedó en el sistema; el archivo PDF del servidor aún no está implementado en backend."
        );
      } else {
        toast.success(
          "Informe abierto para impresión. En el diálogo elija «Guardar como PDF»."
        );
      }
    } catch (error) {
      toast.error(getErrorMessage(error, "No se pudo completar la exportación."));
    } finally {
      setIsExporting(false);
    }
  };

  if (!preview) return null;

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      maxWidthClassName="max-w-5xl"
      title="Vista previa del informe"
      subtitle="Los datos provienen de la API en tiempo real. La exportación abre una ventana dedicada con el informe completo."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
            Cerrar
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleExport}
            disabled={isExporting}
            className="cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">file_download</span>
            {isExporting ? "Exportando…" : "Descargar informe (PDF)"}
          </Button>
        </div>
      }
    >
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <p className="text-sm text-outline print:hidden">
          Revise métricas, indicadores y el listado antes de descargar. Se abrirá una ventana nueva; en
          el diálogo de impresión elija «Guardar como PDF».
        </p>

        <div className="mx-auto max-w-[820px] rounded-xl border border-outline-variant/25 bg-white p-6 shadow-sm sm:p-8">
          <style dangerouslySetInnerHTML={{ __html: REPORT_PRINT_STYLES }} />
          <ReportPrintDocument preview={preview} />
        </div>
      </div>
    </BottomSheet>
  );
}
