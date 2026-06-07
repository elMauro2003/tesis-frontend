"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { authService } from "@/core/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { getDefaultRouteForRoles } from "@/configs/permissions";

function LoginBrandDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute top-1/3 -right-16 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 h-48 w-48 rounded-full bg-primary-fixed/20 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login({ username, password });
      setCredentials(response.user, response.access, response.refresh);

      const callbackUrl = searchParams.get("callbackUrl");
      router.replace(callbackUrl || getDefaultRouteForRoles(response.user.roles));
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Credenciales incorrectas. Verifique e intente nuevamente.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[100dvh] w-full flex-col bg-surface text-on-surface md:h-[100dvh] md:max-h-[100dvh] md:flex-row md:overflow-hidden">
      {/* Brand panel */}
      <section className="relative flex shrink-0 flex-col bg-primary-gradient md:h-full md:w-1/2 md:overflow-hidden md:p-10 lg:p-14">
        <LoginBrandDecorations />

        {/* Mobile: compact hero */}
        <div className="relative z-10 px-6 pb-10 pt-[max(2.5rem,env(safe-area-inset-top))] md:hidden">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 glass-effect">
              <span
                className="material-symbols-outlined text-3xl text-white"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
                UCLV
              </p>
              <h1 className="font-headline text-2xl font-extrabold tracking-tight text-white">
                Residencias
              </h1>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm font-medium leading-relaxed text-white/85">
            Portal de gestión académica y residencial universitaria.
          </p>
        </div>

        {/* Desktop: full brand column */}
        <div className="relative z-10 hidden h-full min-h-0 flex-col justify-between gap-6 md:flex">
          <div className="shrink-0">
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 glass-effect lg:mb-10 lg:h-20 lg:w-20">
              <span
                className="material-symbols-outlined text-4xl text-white lg:text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                school
              </span>
            </div>
            <h1 className="mb-3 font-headline text-4xl font-extrabold tracking-tight text-white lg:mb-4 lg:text-5xl xl:text-6xl">
              UCLV Residencias
            </h1>
            <p className="max-w-md text-base font-medium leading-relaxed text-white/80 lg:text-lg">
              Portal Inteligente de Gestión Académica y Residencial
            </p>
          </div>

          <div className="group relative min-h-0 max-h-44 flex-1 overflow-hidden rounded-2xl lg:max-h-52 xl:max-h-60">
            <img
              alt="Campus universitario"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-xn_e2FN_422IOWmt7Rkrttm0o0JPr_RZc-venmHvTv6HudKTK7z5WYQKq2eP8TLVPDRXv0E-FlXSS2iNQ_0um1Mjx59Kyg2BGIzSM8Pl8axTqbwF7MPfBmiozB_RqWcPI5z75UDsXt2qoG4lSkgkfLYDTF8cdW1ynKhN3M9gk0UIWetl0_MQTEDtphyjAFNiza6TVVqRj2-slot30psEv50oye2PwA9bwALCcROzWtyY_Ad_rFuOvomgr8NIcRYWQPkIKnl8wg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/70 to-transparent" />
          </div>

          <p className="shrink-0 text-sm font-medium tracking-wide text-white/60">
            © 2026 Universidad Central &quot;Marta Abreu&quot; de Las Villas.
          </p>
        </div>
      </section>

      {/* Login form */}
      <section className="relative z-20 -mt-6 flex flex-1 flex-col rounded-t-[1.75rem] bg-surface-container-lowest px-6 py-8 shadow-[0_-12px_40px_rgba(0,55,176,0.08)] md:mt-0 md:h-full md:min-h-0 md:w-1/2 md:justify-center md:overflow-y-auto md:rounded-none md:shadow-none md:px-12 md:py-8 lg:px-20 lg:py-10">
        <div className="mx-auto flex w-full max-w-md flex-col justify-center pb-[max(1.5rem,env(safe-area-inset-bottom))] md:pb-0">
          <div className="mb-6 text-center md:mb-8 md:text-left">
            <h2 className="mb-2 font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              Iniciar sesión
            </h2>
            <p className="text-sm font-medium text-on-surface-variant sm:text-base">
              Ingrese sus credenciales institucionales para acceder al sistema
            </p>
          </div>

          <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
            {error ? (
              <div className="rounded-xl bg-error-container p-4 text-sm font-medium text-error">
                {error}
              </div>
            ) : null}

            <FormField
              id="username"
              name="username"
              label="Usuario o correo institucional"
              icon="person"
              placeholder="ej. admin@uclv.cu"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="username"
            />

            <FormField
              id="password"
              name="password"
              label="Contraseña"
              icon="lock"
              placeholder="••••••••"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
              autoComplete="current-password"
              rightElement={
                <button
                  className="flex h-full cursor-pointer items-center justify-center rounded px-2 text-outline transition-colors hover:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined text-[22px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              }
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="flex h-auto w-full items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-bold text-white shadow-none transition-all duration-300 hover:bg-primary-hover hover:shadow-xl hover:shadow-primary/10 active:scale-[0.98]"
            >
              <span>{isLoading ? "Autenticando…" : "Acceder al sistema"}</span>
              <span className="material-symbols-outlined">
                {isLoading ? "hourglass_empty" : "login"}
              </span>
            </Button>
          </form>

          <p className="mt-6 text-center text-[11px] font-medium text-outline md:hidden">
            © 2026 UCLV · Marta Abreu de Las Villas
          </p>
        </div>
      </section>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[100dvh] w-full items-center justify-center bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
