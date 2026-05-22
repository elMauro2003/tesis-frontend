import { AuthTokens } from "@/types/auth";
import { API_URL } from "@/configs/env";

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
export const fetchClient = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  // 1. Get tokens from localStorage
  const accessToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const config: RequestInit = {
    ...options,
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

          // Retry original request with new token
          headers.set("Authorization", `Bearer ${access}`);
          response = await fetch(url, { ...config, headers });
        } else {
          // Refresh token expired or invalid
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          // Optionally trigger global logout event here
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
    throw new FetchError(response.status, response.statusText, errorData);
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
