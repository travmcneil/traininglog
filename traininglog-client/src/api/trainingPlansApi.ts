import axiosInstance from "./axiosInstance";
import type { TrainingPlanDto, CreateTrainingPlanDto } from "../types";

export const trainingPlansApi = {
  getAll: async (): Promise<TrainingPlanDto[]> => {
    const response =
      await axiosInstance.get<TrainingPlanDto[]>("/trainingplans");
    return response.data;
  },

  getById: async (id: number): Promise<TrainingPlanDto> => {
    const response = await axiosInstance.get<TrainingPlanDto>(
      `/trainingplans/${id}`,
    );
    return response.data;
  },

  create: async (dto: CreateTrainingPlanDto): Promise<TrainingPlanDto> => {
    const response = await axiosInstance.post<TrainingPlanDto>(
      "/trainingplans",
      dto,
    );
    return response.data;
  },

  update: async (id: number, dto: CreateTrainingPlanDto): Promise<void> => {
    await axiosInstance.put(`/trainingplans/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/trainingplans/${id}`);
  },
};
