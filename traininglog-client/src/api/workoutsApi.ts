import axiosInstance from "./axiosInstance";
import type { WorkoutDto, CreateWorkoutDto } from "../types";

export const workoutsApi = {
  getAll: async (trainingPlanId?: number): Promise<WorkoutDto[]> => {
    const response = await axiosInstance.get<WorkoutDto[]>("/workouts", {
      params: trainingPlanId ? { trainingPlanId } : undefined,
    });
    return response.data;
  },

  getById: async (id: number): Promise<WorkoutDto> => {
    const response = await axiosInstance.get<WorkoutDto>(`/workouts/${id}`);
    return response.data;
  },

  create: async (dto: CreateWorkoutDto): Promise<WorkoutDto> => {
    const response = await axiosInstance.post<WorkoutDto>("/workouts", dto);
    return response.data;
  },

  update: async (id: number, dto: CreateWorkoutDto): Promise<void> => {
    await axiosInstance.put(`/workouts/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/workouts/${id}`);
  },
};
