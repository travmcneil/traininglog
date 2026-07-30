import axiosInstance from "./axiosInstance";
import type { RegisterDto, LoginDto, AuthResponseDto, ChangePasswordDto, UserProfileDto, UpdateProfileDto, ChangeEmailDto } from "../types";

export const authApi = {
  register: async (dto: RegisterDto): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>('/auth/register', dto);
    return response.data;
  },

  login: async (dto: LoginDto): Promise<AuthResponseDto> => {
    const response = await axiosInstance.post<AuthResponseDto>('/auth/login', dto);
    return response.data;
  },

  getProfile: async (): Promise<UserProfileDto> => {
    const response = await axiosInstance.get<UserProfileDto>('/auth/me');
    return response.data;
  },

  updateProfile: async (dto: UpdateProfileDto): Promise<void> => {
    await axiosInstance.put('/auth/me', dto);
  },

  changePassword: async (dto: ChangePasswordDto): Promise<void> => {
    await axiosInstance.post('/auth/change-password', dto);
  },

  changeEmail: async (dto: ChangeEmailDto): Promise<AuthResponseDto> => {
  const response = await axiosInstance.put<AuthResponseDto>('/auth/change-email', dto);
  return response.data;
},

};
