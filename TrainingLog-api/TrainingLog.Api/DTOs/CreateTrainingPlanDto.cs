namespace TrainingLog.Api.DTOs
{
    public class CreateTrainingPlanDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int DurationWeeks { get; set; }
    }
}
