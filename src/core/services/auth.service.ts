import { fetchClient } from "@/lib/fetchClient";
import { LoginResponse, User } from "@/types/auth";

export const authService = {
  login: (credentials: { username: string; password: string }): Promise<LoginResponse> => {
    return fetchClient<LoginResponse>("/api/v1/auth/login/", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async (): Promise<void> => {
    try {
      await fetchClient("/api/v1/auth/logout/", {
        method: "POST",
      });
    } catch (e) {
      // Ignore errors on logout (e.g. token already expired)
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },

  getMe: (): Promise<User> => {
    return fetchClient<User>("/api/v1/auth/me/", {
      method: "GET",
    });
  },
};
