export type Role =
  | "estudiante"
  | "instructor"
  | "directivo"
  | "subdirector"
  | "comunicador"
  | "decano"
  | "ppa"
  | "pg"
  | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  roles: Role[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
}

export interface RefreshResponse {
  access: string;
}
