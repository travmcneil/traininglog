using Microsoft.AspNetCore.Identity;

namespace TrainingLog.Domain.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<TrainingPlan> TrainingPlans { get; set; } = new List<TrainingPlan>();
        public ICollection<Shoe> Shoes { get; set; } = new List<Shoe>();
    }
}
