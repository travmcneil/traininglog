using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrainingLog.Api.DTOs;
using TrainingLog.Infrastructure.Data;

namespace TrainingLog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DashboardController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var dashboard = new DashboardDto();

            // --- Active training plan ---
            var activePlan = await _context.TrainingPlans
                .Where(p => p.UserId == CurrentUserId && p.IsActive)
                .OrderByDescending(p => p.StartDate)
                .FirstOrDefaultAsync();

            if (activePlan != null)
            {
                var daysSinceStart = (DateTime.UtcNow.Date - activePlan.StartDate.Date).Days;
                var currentWeek = Math.Max(1, (daysSinceStart / 7) + 1);

                dashboard.ActiveTrainingPlan = new ActiveTrainingPlanSummary
                {
                    Id = activePlan.Id,
                    Name = activePlan.Name,
                    StartDate = activePlan.StartDate,
                    DurationWeeks = activePlan.DurationWeeks,
                    CurrentWeek = Math.Min(currentWeek, activePlan.DurationWeeks)
                };

                // --- Upcoming race for this plan ---
                var upcomingRace = await _context.Races
                    .Where(r => r.TrainingPlanId == activePlan.Id && r.RaceDate >= DateTime.UtcNow.Date)
                    .OrderBy(r => r.RaceDate)
                    .FirstOrDefaultAsync();

                if (upcomingRace != null)
                {
                    dashboard.UpcomingRace = new UpcomingRaceSummary
                    {
                        Id = upcomingRace.Id,
                        Name = upcomingRace.Name,
                        RaceDate = upcomingRace.RaceDate,
                        DaysUntilRace = (upcomingRace.RaceDate.Date - DateTime.UtcNow.Date).Days,
                        DistanceMiles = upcomingRace.DistanceMiles
                    };
                }
            }

            // --- Weekly mileage for the last 8 weeks ---
            var eightWeeksAgo = DateTime.UtcNow.Date.AddDays(-56);

            var recentWorkouts = await _context.Workouts
                .Include(w => w.TrainingPlan)
                .Where(w => w.TrainingPlan!.UserId == CurrentUserId && w.Date >= eightWeeksAgo)
                .ToListAsync();

            dashboard.WeeklyMileage = recentWorkouts
                .GroupBy(w => StartOfWeek(w.Date))
                .Select(g => new WeeklyMileageSummary
                {
                    WeekStartDate = g.Key,
                    PlannedMiles = g.Sum(w => w.PlannedDistanceMiles ?? 0),
                    ActualMiles = g.Sum(w => w.ActualDistanceMiles ?? 0)
                })
                .OrderBy(w => w.WeekStartDate)
                .ToList();

            // --- Overall totals (all-time, not just last 8 weeks) ---
            var allWorkouts = await _context.Workouts
                .Include(w => w.TrainingPlan)
                .Where(w => w.TrainingPlan!.UserId == CurrentUserId)
                .ToListAsync();

            dashboard.TotalWorkoutsCompleted = allWorkouts.Count(w => w.Completed);
            dashboard.TotalMilesRun = allWorkouts.Sum(w => w.ActualDistanceMiles ?? 0);

            return Ok(dashboard);
        }

        private static DateTime StartOfWeek(DateTime date)
        {
            // Weeks start on Monday
            int diff = (7 + (date.DayOfWeek - DayOfWeek.Monday)) % 7;
            return date.Date.AddDays(-diff);
        }
    }
}