export interface ActiveTrainingPlanSummary {
  id: number;
  name: string;
  startDate: string;
  durationWeeks: number;
  currentWeek: number;
}

export interface UpcomingRaceSummary {
  id: number;
  name: string;
  raceDate: string;
  daysUntilRace: number;
  distanceMiles: number;
}

export interface WeeklyMileageSummary {
  weekStartDate: string;
  plannedMiles: number;
  actualMiles: number;
}

export interface DashboardDto {
  activeTrainingPlan: ActiveTrainingPlanSummary | null;
  upcomingRace: UpcomingRaceSummary | null;
  weeklyMileage: WeeklyMileageSummary[];
  totalWorkoutsCompleted: number;
  totalMilesRun: number;
}
