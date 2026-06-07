import { API_URL } from "@/configs/env";
import {
  clearAuthSessionCookies,
  syncAccessTokenCookie,
} from "@/utils/auth/sessionCookies";

export type FetchClientOptions = RequestInit & {
  /** Si es true, no dispara el handler global de 403. */
  suppressForbiddenEvent?: boolean;
};

const FORBIDDEN_MESSAGE =
  "No tienes permiso para realizar esta acción.";

const extractHumanErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const preferredKeys = ["message", "detail", "error"];

  for (const key of preferredKeys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (value && typeof value === "object") {
      const nestedMessage = extractHumanErrorMessage(value);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  const nonFieldErrors = record.non_field_errors;
  if (Array.isArray(nonFieldErrors)) {
    const firstString = nonFieldErrors.find((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (firstString) {
      return firstString.trim();
    }
  }

  for (const value of Object.values(record)) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const firstString = value.find((item): item is string => typeof item === "string" && item.trim().length > 0);
      if (firstString) {
        return firstString.trim();
      }
    }

    if (value && typeof value === "object") {
      const nestedMessage = extractHumanErrorMessage(value);
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return null;
};

const GENERIC_400_MESSAGE = "Los datos enviados no son válidos. Revisa los campos e inténtalo de nuevo.";

export class FetchError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "FetchError";
  }
}

// Interceptor-like fetch wrapper
const dispatchForbiddenEvent = (message: string, endpoint: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("auth:forbidden", {
      detail: { message, endpoint },
    })
  );
};

export const fetchClient = async <T>(
  endpoint: string,
  options: FetchClientOptions = {}
): Promise<T> => {
  const { suppressForbiddenEvent = false, ...requestOptions } = options;
  const url = `${API_URL}${endpoint}`;

  // 1. Get tokens from localStorage
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers(requestOptions.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...requestOptions,
    headers,
  };

  let response = await fetch(url, config);

  // 2. Handle 401 Unauthorized (Token refresh logic)
  if (response.status === 401 && accessToken) {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshRes.ok) {
          const { access } = await refreshRes.json();
          localStorage.setItem("access_token", access);
          syncAccessTokenCookie(access);

          // Retry original request with new token
          headers.set("Authorization", `Bearer ${access}`);
          response = await fetch(url, { ...config, headers });
        } else {
          // Refresh token expired or invalid
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          clearAuthSessionCookies();
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      } catch (err) {
        console.error("Error refreshing token:", err);
      }
    }
  }

  // 3. Process Response
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    const extractedMessage = extractHumanErrorMessage(errorData);
    const normalizedMessage = response.status === 400
      ? (extractedMessage && extractedMessage !== "Los datos proporcionados no son válidos." && extractedMessage !== "Bad Request"
          ? extractedMessage
          : GENERIC_400_MESSAGE)
      : response.status === 403
        ? (extractedMessage || FORBIDDEN_MESSAGE)
        : (extractedMessage || "Ocurrió un error al procesar la solicitud. Intente nuevamente.");

    if (response.status === 403 && !suppressForbiddenEvent) {
      dispatchForbiddenEvent(normalizedMessage, endpoint);
    }

    throw new FetchError(response.status, normalizedMessage, errorData);
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
