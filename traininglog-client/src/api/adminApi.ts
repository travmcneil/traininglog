import axiosInstance from "./axiosInstance";
import type { AdminUserDto, UpdateUserDto, UpdateUserRolesDto } from "../types";

export const adminApi = {
  getAllUsers: async (): Promise<AdminUserDto[]> => {
    const response = await axiosInstance.get<AdminUserDto[]>("/admin/users");
    return response.data;
  },

  getUserById: async (id: string): Promise<AdminUserDto> => {
    const response = await axiosInstance.get<AdminUserDto>(
      `/admin/users/${id}`,
    );
    return response.data;
  },

  updateUser: async (id: string, dto: UpdateUserDto): Promise<void> => {
    await axiosInstance.put(`/admin/users/${id}`, dto);
  },

  updateUserRoles: async (
    id: string,
    dto: UpdateUserRolesDto,
  ): Promise<void> => {
    await axiosInstance.put(`/admin/users/${id}/roles`, dto);
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/admin/users/${id}`);
  },
};
