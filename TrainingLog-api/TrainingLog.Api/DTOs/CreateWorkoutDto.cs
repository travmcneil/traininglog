using TrainingLog.Domain.Entities;

namespace TrainingLog.Api.DTOs
{
    public class CreateWorkoutDto
    {
        public DateTime Date { get; set; }
        public WorkoutType Type { get; set; }
        public decimal? PlannedDistanceMiles { get; set; }
        public decimal? ActualDistanceMiles { get; set; }
        public TimeSpan? PlannedPace { get; set; }
        public TimeSpan? ActualPace { get; set; }
        public TimeSpan? Duration { get; set; }
        public string? Notes { get; set; }
        public bool Completed { get; set; }
        public int TrainingPlanId { get; set; }
        public int? ShoeId { get; set; }
    }
}