namespace TrainingLog.Api.DTOs
{
    public class CreateShoeDto
    {
        public string Name { get; set; } = string.Empty;
        public DateTime DateAcquired { get; set; }
        public bool Retired { get; set; }
    }
}
