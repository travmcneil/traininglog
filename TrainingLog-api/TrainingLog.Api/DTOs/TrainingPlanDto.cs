namespace TrainingLog.Api.DTOs
{
    public class TrainingPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int DurationWeeks { get; set; }
        public bool IsActive { get; set; }
    }
}
