// Mirrors the C# enum WorkoutType exactly — values must match (Run = 0, CrossTrain = 1, Rest = 2)
export const WorkoutType = {
  Run: 0,
  CrossTrain: 1,
  Rest: 2,
} as const;

export type WorkoutType = (typeof WorkoutType)[keyof typeof WorkoutType];

export interface WorkoutDto {
  id: number;
  date: string;
  type: WorkoutType;
  plannedDistanceMiles: number | null;
  actualDistanceMiles: number | null;
  plannedPace: string | null;
  actualPace: string | null;
  duration: string | null;
  notes: string | null;
  completed: boolean;
  trainingPlanId: number;
  shoeId: number | null;
}

export interface CreateWorkoutDto {
  date: string;
  type: WorkoutType;
  plannedDistanceMiles: number | null;
  actualDistanceMiles: number | null;
  plannedPace: string | null;
  actualPace: string | null;
  duration: string | null;
  notes: string | null;
  completed: boolean;
  trainingPlanId: number;
  shoeId: number | null;
}
