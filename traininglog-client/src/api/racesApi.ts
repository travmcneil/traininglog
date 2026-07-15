import axiosInstance from "./axiosInstance";
import type { RaceDto, CreateRaceDto } from "../types";

export const racesApi = {
  getAll: async (trainingPlanId?: number): Promise<RaceDto[]> => {
    const response = await axiosInstance.get<RaceDto[]>("/races", {
      params: trainingPlanId ? { trainingPlanId } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<RaceDto> => {
    const response = await axiosInstance.get<RaceDto>(`/races/${id}`);
    return response.data;
  },

  create: async (dto: CreateRaceDto): Promise<RaceDto> => {
    const response = await axiosInstance.post<RaceDto>("/races", dto);
    return response.data;
  },

  update: async (id: number, dto: CreateRaceDto): Promise<void> => {
    await axiosInstance.put(`/races/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/races/${id}`);
  },
};
