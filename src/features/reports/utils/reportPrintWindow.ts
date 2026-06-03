import { toast } from "sonner";
import { REPORT_PRINT_STYLES } from "@/features/reports/utils/reportPrintStyles";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const openReportPrintWindow = (reportName: string, bodyHtml: string): boolean => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) {
    toast.error("Permita ventanas emergentes para exportar el PDF.");
    return false;
  }

  const safeTitle = escapeHtml(reportName);

  printWindow.document.open();
  printWindow.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>${REPORT_PRINT_STYLES}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`);
  printWindow.document.close();

  const triggerPrint = () => {
    printWindow.focus();
    printWindow.print();
  };

  printWindow.onload = triggerPrint;

  if (printWindow.document.readyState === "complete") {
    window.setTimeout(triggerPrint, 250);
  }

  printWindow.onafterprint = () => {
    printWindow.close();
  };

  return true;
};
