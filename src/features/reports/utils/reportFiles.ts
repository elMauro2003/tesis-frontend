import { API_URL } from "@/configs/env";
import { FetchError } from "@/lib/fetchClient";

export const resolveMediaUrl = (fileUrl: string | null | undefined): string | null => {
  if (!fileUrl || !fileUrl.trim()) return null;

  const trimmed = fileUrl.trim();
  if (trimmed === "#" || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      const apiOrigin = new URL(API_URL).origin;
      if (parsed.origin !== apiOrigin && parsed.pathname.startsWith("/media/")) {
        return `${API_URL.replace(/\/$/, "")}${parsed.pathname}${parsed.search}`;
      }
      return trimmed;
    } catch {
      return trimmed;
    }
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${API_URL.replace(/\/$/, "")}${path}`;
};

export const isReportFileReady = (fileUrl: string | null | undefined): boolean =>
  resolveMediaUrl(fileUrl) !== null;

export const downloadAuthenticatedFile = async (fileUrl: string, filename: string) => {
  const resolvedUrl = resolveMediaUrl(fileUrl);
  if (!resolvedUrl) {
    throw new Error("El informe no tiene un archivo disponible para descargar.");
  }

  const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const response = await fetch(resolvedUrl, {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

  if (!response.ok) {
    throw new FetchError(
      response.status,
      response.status === 404
        ? "El archivo del informe no existe en el servidor."
        : "No se pudo descargar el informe."
    );
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};

export const verifyReportFileExists = async (fileUrl: string): Promise<boolean> => {
  const resolvedUrl = resolveMediaUrl(fileUrl);
  if (!resolvedUrl) return false;

  const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  try {
    const response = await fetch(resolvedUrl, {
      method: "HEAD",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.ok;
  } catch {
    return false;
  }
};
