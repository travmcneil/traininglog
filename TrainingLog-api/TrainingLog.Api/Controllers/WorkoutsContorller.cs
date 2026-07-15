using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrainingLog.Api.DTOs;
using TrainingLog.Domain.Entities;
using TrainingLog.Infrastructure.Data;

namespace TrainingLog.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WorkoutsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutsController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        private static WorkoutDto ToDto(Workout w) => new WorkoutDto
        {
            Id = w.Id,
            Date = w.Date,
            Type = w.Type,
            PlannedDistanceMiles = w.PlannedDistanceMiles,
            ActualDistanceMiles = w.ActualDistanceMiles,
            PlannedPace = w.PlannedPace,
            ActualPace = w.ActualPace,
            Duration = w.Duration,
            Notes = w.Notes,
            Completed = w.Completed,
            TrainingPlanId = w.TrainingPlanId,
            ShoeId = w.ShoeId
        };

        // GET: api/workouts?trainingPlanId=5
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? trainingPlanId)
        {
            var query = _context.Workouts
                .Include(w => w.TrainingPlan)
                .Where(w => w.TrainingPlan!.UserId == CurrentUserId);

            if (trainingPlanId.HasValue)
            {
                query = query.Where(w => w.TrainingPlanId == trainingPlanId.Value);
            }

            var workouts = await query
                .OrderBy(w => w.Date)
                .Select(w => ToDto(w))
                .ToListAsync();

            return Ok(workouts);
        }

        // GET: api/workouts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var workout = await _context.Workouts
                .Include(w => w.TrainingPlan)
                .FirstOrDefaultAsync(w => w.Id == id && w.TrainingPlan!.UserId == CurrentUserId);

            if (workout == null) return NotFound();

            return Ok(ToDto(workout));
        }

        // POST: api/workouts
        [HttpPost]
        public async Task<IActionResult> Create(CreateWorkoutDto dto)
        {
            // Verify the TrainingPlanId actually belongs to the current user
            var planExists = await _context.TrainingPlans
                .AnyAsync(p => p.Id == dto.TrainingPlanId && p.UserId == CurrentUserId);

            if (!planExists)
            {
                return BadRequest("Invalid training plan.");
            }

            // If a shoe is specified, verify it belongs to the current user too
            if (dto.ShoeId.HasValue)
            {
                var shoeExists = await _context.Shoes
                    .AnyAsync(s => s.Id == dto.ShoeId.Value && s.UserId == CurrentUserId);

                if (!shoeExists)
                {
                    return BadRequest("Invalid shoe.");
                }
            }

            var workout = new Workout
            {
                Date = dto.Date,
                Type = dto.Type,
                PlannedDistanceMiles = dto.PlannedDistanceMiles,
                ActualDistanceMiles = dto.ActualDistanceMiles,
                PlannedPace = dto.PlannedPace,
                ActualPace = dto.ActualPace,
                Duration = dto.Duration,
                Notes = dto.Notes,
                Completed = dto.Completed,
                TrainingPlanId = dto.TrainingPlanId,
                ShoeId = dto.ShoeId
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = workout.Id }, ToDto(workout));
        }

        // PUT: api/workouts/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateWorkoutDto dto)
        {
            var workout = await _context.Workouts
                .Include(w => w.TrainingPlan)
                .FirstOrDefaultAsync(w => w.Id == id && w.TrainingPlan!.UserId == CurrentUserId);

            if (workout == null) return NotFound();

            if (dto.ShoeId.HasValue)
            {
                var shoeExists = await _context.Shoes
                    .AnyAsync(s => s.Id == dto.ShoeId.Value && s.UserId == CurrentUserId);

                if (!shoeExists)
                {
                    return BadRequest("Invalid shoe.");
                }
            }

            workout.Date = dto.Date;
            workout.Type = dto.Type;
            workout.PlannedDistanceMiles = dto.PlannedDistanceMiles;
            workout.ActualDistanceMiles = dto.ActualDistanceMiles;
            workout.PlannedPace = dto.PlannedPace;
            workout.ActualPace = dto.ActualPace;
            workout.Duration = dto.Duration;
            workout.Notes = dto.Notes;
            workout.Completed = dto.Completed;
            workout.ShoeId = dto.ShoeId;
            // Note: intentionally NOT allowing TrainingPlanId to be changed on update —
            // moving a workout to a different plan is unusual; treat as delete+recreate if needed

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/workouts/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var workout = await _context.Workouts
                .Include(w => w.TrainingPlan)
                .FirstOrDefaultAsync(w => w.Id == id && w.TrainingPlan!.UserId == CurrentUserId);

            if (workout == null) return NotFound();

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}