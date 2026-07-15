namespace TrainingLog.Api.DTOs
{
    public class DashboardDto
    {
        public ActiveTrainingPlanSummary? ActiveTrainingPlan { get; set; }
        public UpcomingRaceSummary? UpcomingRace { get; set; }
        public List<WeeklyMileageSummary> WeeklyMileage { get; set; } = new();
        public int TotalWorkoutsCompleted { get; set; }
        public decimal TotalMilesRun { get; set; }
    }

    public class ActiveTrainingPlanSummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int DurationWeeks { get; set; }
        public int CurrentWeek { get; set; }
    }

    public class UpcomingRaceSummary
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime RaceDate { get; set; }
        public int DaysUntilRace { get; set; }
        public decimal DistanceMiles { get; set; }
    }

    public class WeeklyMileageSummary
    {
        public DateTime WeekStartDate { get; set; }
        public decimal PlannedMiles { get; set; }
        public decimal ActualMiles { get; set; }
    }
}