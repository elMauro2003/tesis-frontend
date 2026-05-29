import { fetchClient } from "@/lib/fetchClient";
import { User, Role } from "@/types/auth";
import { PaginatedResponse } from "@/types/models";

export interface GetUsersFilters {
  search?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

const buildQueryString = (filters: GetUsersFilters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });

  return params.toString();
};

export const adminService = {
  // Roles
  getRoles: (): Promise<Role[]> => fetchClient("/api/v1/roles/"),

  // Users
  getUsers: (filters: GetUsersFilters = {}): Promise<PaginatedResponse<User>> => {
    const queryString = buildQueryString(filters);
    return fetchClient<PaginatedResponse<User>>(`/api/v1/auth/usuarios/${queryString ? `?${queryString}` : ""}`);
  },
  
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
