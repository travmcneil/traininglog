namespace TrainingLog.Api.DTOs
{
    public class RaceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime RaceDate { get; set; }
        public decimal DistanceMiles { get; set; }
        public TimeSpan? TargetTime { get; set; }
        public int TrainingPlanId { get; set; }
    }
}
