import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement, ReactNode } from "react";
import { Role, User } from "@/types/auth";
import { useAuthStore } from "@/store/useAuthStore";

export const mockDirectivoUser: User = {
  id: 1,
  username: "directivo.test",
  email: "directivo@uclv.cu",
  roles: ["directivo"],
};

export const mockSubdirectorUser: User = {
  id: 2,
  username: "subdirector.test",
  email: "subdirector@uclv.cu",
  roles: ["subdirector"],
};

export const mockInstructorUser: User = {
  id: 3,
  username: "instructor.test",
  email: "instructor@uclv.cu",
  roles: ["instructor"],
};

export function setMockAuthUser(user: User | null) {
  useAuthStore.setState({
    user,
    isAuthenticated: Boolean(user),
    isLoading: false,
  });
}

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

function TestProviders({ children, queryClient }: ProvidersProps) {
  const client = queryClient ?? createTestQueryClient();

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions & { queryClient?: QueryClient; user?: User | null }
) {
  const { queryClient, user = mockDirectivoUser, ...renderOptions } = options ?? {};
  setMockAuthUser(user);

  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders queryClient={queryClient}>{children}</TestProviders>
    ),
    ...renderOptions,
  });
}

export function emptyPaginated<T>() {
  return { count: 0, next: null, previous: null, results: [] as T[] };
}

export function withRole(user: User, role: Role): User {
  return { ...user, roles: [role] };
}
