namespace TrainingLog.Domain.Entities
{
    public class TrainingPlan
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public int DurationWeeks { get; set; }
        public bool IsActive { get; set; } = true;

        // Foreign key
        public string UserId { get; set; } = string.Empty;
        public ApplicationUser? User { get; set; }

        // Navigation properties
        public ICollection<Race> Races { get; set; } = new List<Race>();
        public ICollection<Workout> Workouts { get; set; } = new List<Workout>();
    }
}
