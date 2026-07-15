namespace TrainingLog.Domain.Entities
{
    public class Race
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime RaceDate { get; set; }
        public decimal DistanceMiles { get; set; }
        public TimeSpan? TargetTime { get; set; }

        // Foreign key
        public int TrainingPlanId { get; set; }
        public TrainingPlan? TrainingPlan { get; set; }
    }
}
