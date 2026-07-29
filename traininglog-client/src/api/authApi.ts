import axiosInstance from "./axiosInstance";
import type { RegisterDto, LoginDto, AuthResponseDto, ChangePasswordDto } from "../types";

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>('/auth/register', dto);
    return response.data;
  },

  login: async (dto: LoginDto): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>('/auth/login', dto);
    return response.data;
  },

  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await axiosInstance.post('/auth/change-password', dto);
  },
};
