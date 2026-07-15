namespace TrainingLog.Domain.Entities
{
    public class Shoe
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime DateAcquired { get; set; }
        public bool Retired { get; set; } = false;

        // Foreign key
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        // Navigation property
        public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    }
}
