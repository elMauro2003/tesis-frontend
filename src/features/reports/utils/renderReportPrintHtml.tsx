"use client";

import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { ReportPrintDocument } from "@/features/reports/components/ReportPrintDocument";
import type { ReportPreviewModel } from "@/features/reports/utils/reportPreview";

export const renderReportPrintHtml = (preview: ReportPreviewModel): string => {
  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-10000px";
  host.style.top = "0";
  host.style.width = "210mm";
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    flushSync(() => {
      root.render(<ReportPrintDocument preview={preview} />);
    });
    return host.innerHTML;
  } finally {
    root.unmount();
    host.remove();
  }
};
