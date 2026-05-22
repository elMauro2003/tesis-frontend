"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { AuthProvider } from "./AuthProvider";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  // Inicializamos el QueryClient de forma segura dentro del componente (usando use state) 
  // para evitar que se comparta el caché en el entorno de SSR entre diferentes usuarios (Next.js context).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 1, // Los datos se consideran "frescos" por 1 minuto
            refetchOnWindowFocus: false, // Evita re-featching compulsivos al salir/entrar de la pestaña
            retry: 1, // Solo hace un intento de retry si la red falla (previene flood de peticiones)
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
      </AuthProvider>
      {/* DevTools solo visibles en entorno de desarrollo. Botón fijo asilado. */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
