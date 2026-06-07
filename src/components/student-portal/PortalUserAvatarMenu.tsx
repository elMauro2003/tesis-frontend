"use client";

import { useAuthStore } from "@/store/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PortalUserAvatarMenu() {
  const { user, logout } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "ES";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary ring-2 ring-primary/10 transition-all hover:ring-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Menú de usuario"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem
          onClick={logout}
          className="cursor-pointer text-error focus:bg-error-container/40 focus:text-error"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
