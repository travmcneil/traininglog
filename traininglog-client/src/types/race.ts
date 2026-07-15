export interface RaceDto {
  id: number;
  name: string;
  raceDate: string;
  distanceMiles: number;
  targetTime: string | null;
  trainingPlanId: number;
}

export interface CreateRaceDto {
  name: string;
  raceDate: string;
  distanceMiles: number;
  targetTime: string | null;
  trainingPlanId: number;
}
