using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TrainingLog.Domain.Entities;

namespace TrainingLog.Infrastructure.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<TrainingPlan> TrainingPlans { get; set; }
        public DbSet<Race> Races { get; set; }
        public DbSet<Workout> Workouts { get; set; }
        public DbSet<Shoe> Shoes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // IMPORTANT: must call this first for Identity tables to configure correctly

            // TrainingPlan -> ApplicationUser (many-to-one)
            builder.Entity<TrainingPlan>()
                .HasOne(tp => tp.User)
                .WithMany(u => u.TrainingPlans)
                .HasForeignKey(tp => tp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Shoe -> ApplicationUser (many-to-one)
            builder.Entity<Shoe>()
                .HasOne(s => s.User)
                .WithMany(u => u.Shoes)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Race -> TrainingPlan (many-to-one)
            builder.Entity<Race>()
                .HasOne(r => r.TrainingPlan)
                .WithMany(tp => tp.Races)
                .HasForeignKey(r => r.TrainingPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            // Workout -> TrainingPlan (many-to-one)
            builder.Entity<Workout>()
                .HasOne(w => w.TrainingPlan)
                .WithMany(tp => tp.Workouts)
                .HasForeignKey(w => w.TrainingPlanId)
                .OnDelete(DeleteBehavior.Cascade);

            // Workout -> Shoe (many-to-one, OPTIONAL - nullable FK)
            builder.Entity<Workout>()
                .HasOne(w => w.Shoe)
                .WithMany(s => s.Workouts)
                .HasForeignKey(w => w.ShoeId)
                .OnDelete(DeleteBehavior.SetNull); // if a shoe is deleted, don't delete its workout history

            // Decimal precision - SQL Server needs this explicitly or you'll get truncation warnings
            builder.Entity<Race>()
                .Property(r => r.DistanceMiles)
                .HasColumnType("decimal(6,2)");

            builder.Entity<Workout>()
                .Property(w => w.PlannedDistanceMiles)
                .HasColumnType("decimal(6,2)");

            builder.Entity<Workout>()
                .Property(w => w.ActualDistanceMiles)
                .HasColumnType("decimal(6,2)");
        }
    }
}
