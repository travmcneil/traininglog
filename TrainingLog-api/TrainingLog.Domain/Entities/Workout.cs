namespace TrainingLog.Domain.Entities
{
    public enum WorkoutType
    {
        Run,
        CrossTrain,
        Rest
    }

    public class Workout
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public WorkoutType Type { get; set; }
        public decimal? PlannedDistanceMiles { get; set; }
        public decimal? ActualDistanceMiles { get; set; }
        public TimeSpan? PlannedPace { get; set; }
        public TimeSpan? ActualPace { get; set; }
        public TimeSpan? Duration { get; set; }
        public string? Notes { get; set; }
        public bool Completed { get; set; } = false;

        // Foreign keys
        public int TrainingPlanId { get; set; }
        public TrainingPlan? TrainingPlan { get; set; }

        public int? ShoeId { get; set; }
        public Shoe? Shoe { get; set; }
    }
}
