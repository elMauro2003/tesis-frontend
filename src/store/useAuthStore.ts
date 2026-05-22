import { create } from "zustand";
import { User, Role } from "@/types/auth";
import { authService } from "@/core/services/auth.service";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setCredentials: (user: User, access: string, refresh: string) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  hasRole: (role: Role | Role[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setCredentials: (user, access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const user = await authService.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  },

  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;
    
    if (Array.isArray(roles)) {
      return roles.some(role => user.roles.includes(role));
    }
    return user.roles.includes(roles);
  }
}));

// Setup global event listener for unauthorized logouts
if (typeof window !== "undefined") {
  window.addEventListener("auth:logout", () => {
    useAuthStore.getState().logout();
  });
}
