export interface TrainingPlanDto {
  id: number;
  name: string;
  startDate: string;
  durationWeeks: number;
  isActive: boolean;
}

export interface CreateTrainingPlanDto {
  name: string;
  startDate: string;
  durationWeeks: number;
}
