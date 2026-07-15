namespace TrainingLog.Api.DTOs
{
    public class ShoeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime DateAcquired { get; set; }
        public bool Retired { get; set; }
        public decimal TotalMileage { get; set; } // computed, not stored
    }
}
