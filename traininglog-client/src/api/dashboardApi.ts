import axiosInstance from "./axiosInstance";
import type { DashboardDto } from "../types";

export const dashboardApi = {
  get: async (): Promise<DashboardDto> => {
    const response = await axiosInstance.get<DashboardDto>("/dashboard");
    return response.data;
  },
};
