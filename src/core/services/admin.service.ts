import { fetchClient } from "@/lib/fetchClient";
import { User, Role } from "@/types/auth";
import { PaginatedResponse } from "@/types/models";

export const adminService = {
  // Roles
  getRoles: (): Promise<Role[]> => fetchClient("/api/v1/roles/"),

  // Users
  getUsers: (): Promise<PaginatedResponse<User>> => fetchClient("/api/v1/usuarios/"),
  
  getUserById: (id: number): Promise<User> => fetchClient(`/api/v1/usuarios/${id}/`),
  
  // Create user usually has specific payload like password, etc.
  createUser: (data: Partial<User> & { password?: string }): Promise<User> => fetchClient("/api/v1/usuarios/", { method: "POST", body: JSON.stringify(data) }),
  
  updateUser: (id: number, data: Partial<User>): Promise<User> => fetchClient(`/api/v1/usuarios/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  
  deleteUser: (id: number): Promise<void> => fetchClient(`/api/v1/usuarios/${id}/`, { method: "DELETE" }),

  // Role Management
  assignRole: (userId: number, roleId: number): Promise<void> => fetchClient(`/api/v1/usuarios/${userId}/roles/`, { method: "POST", body: JSON.stringify({ role_id: roleId }) }),
  
  removeRole: (userId: number, roleId: number): Promise<void> => fetchClient(`/api/v1/usuarios/${userId}/roles/${roleId}/`, { method: "DELETE" }),

  getPermissions: (userId: number): Promise<string[]> => fetchClient(`/api/v1/usuarios/${userId}/permisos/`),
};
