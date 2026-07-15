import axiosInstance from "./axiosInstance";
import type { ShoeDto, CreateShoeDto } from "../types";

export const shoesApi = {
  getAll: async (): Promise<ShoeDto[]> => {
    const response = await axiosInstance.get<ShoeDto[]>("/shoes");
    return response.data;
  },

  getById: async (id: number): Promise<ShoeDto> => {
    const response = await axiosInstance.get<ShoeDto>(`/shoes/${id}`);
    return response.data;
  },

  create: async (dto: CreateShoeDto): Promise<ShoeDto> => {
    const response = await axiosInstance.post<ShoeDto>("/shoes", dto);
    return response.data;
  },

  update: async (id: number, dto: CreateShoeDto): Promise<void> => {
    await axiosInstance.put(`/shoes/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/shoes/${id}`);
  },
};
