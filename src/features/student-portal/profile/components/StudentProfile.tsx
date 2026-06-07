"use client";

import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchClient, FetchError } from "@/lib/fetchClient";
import { useAuthStore } from "@/store/useAuthStore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";

export function StudentProfile() {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: () =>
      fetchClient("/api/v1/auth/cambiar-contrasena/", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      }),
    onSuccess: () => {
      toast.success("Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      const message =
        error instanceof FetchError ? error.message : "No se pudo cambiar la contraseña.";
      toast.error("Error", { description: message });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    changePasswordMutation.mutate();
  };

  return (
    <PortalPageShell>
      <PortalSectionTitle title="Mi perfil" description="Datos de su cuenta en el portal." />

      <section className="mb-6 rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
        <p className="text-xs font-bold uppercase tracking-widest text-outline">Usuario</p>
        <p className="mt-1 font-headline text-lg font-bold text-on-surface">{user?.username}</p>
        <p className="mt-1 text-sm text-on-surface-variant">{user?.email}</p>
      </section>

      <section className="rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
        <h2 className="font-headline text-lg font-bold text-on-surface">Cambiar contraseña</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Contraseña actual
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Nueva contraseña
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Confirmar contraseña
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="confirm" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? "Guardando..." : "Actualizar contraseña"}
          </Button>
        </form>
      </section>

      <Button type="button" variant="destructive" className="mt-6 w-full" onClick={logout}>
        Cerrar sesión
      </Button>
    </PortalPageShell>
  );
}
