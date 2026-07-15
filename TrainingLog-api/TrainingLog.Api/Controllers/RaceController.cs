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
    public class RacesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RacesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        private static RaceDto ToDto(Race r) => new RaceDto
        {
            Id = r.Id,
            Name = r.Name,
            RaceDate = r.RaceDate,
            DistanceMiles = r.DistanceMiles,
            TargetTime = r.TargetTime,
            TrainingPlanId = r.TrainingPlanId
        };

        // GET: api/races?trainingPlanId=5
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? trainingPlanId)
        {
            var query = _context.Races
                .Include(r => r.TrainingPlan)
                .Where(r => r.TrainingPlan!.UserId == CurrentUserId);

            if (trainingPlanId.HasValue)
            {
                query = query.Where(r => r.TrainingPlanId == trainingPlanId.Value);
            }

            var races = await query
                .OrderBy(r => r.RaceDate)
                .Select(r => ToDto(r))
                .ToListAsync();

            return Ok(races);
        }

        // GET: api/races/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var race = await _context.Races
                .Include(r => r.TrainingPlan)
                .FirstOrDefaultAsync(r => r.Id == id && r.TrainingPlan!.UserId == CurrentUserId);

            if (race == null) return NotFound();

            return Ok(ToDto(race));
        }

        // POST: api/races
        [HttpPost]
        public async Task<IActionResult> Create(CreateRaceDto dto)
        {
            var planExists = await _context.TrainingPlans
                .AnyAsync(p => p.Id == dto.TrainingPlanId && p.UserId == CurrentUserId);

            if (!planExists)
            {
                return BadRequest("Invalid training plan.");
            }

            var race = new Race
            {
                Name = dto.Name,
                RaceDate = dto.RaceDate,
                DistanceMiles = dto.DistanceMiles,
                TargetTime = dto.TargetTime,
                TrainingPlanId = dto.TrainingPlanId
            };

            _context.Races.Add(race);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = race.Id }, ToDto(race));
        }

        // PUT: api/races/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateRaceDto dto)
        {
            var race = await _context.Races
                .Include(r => r.TrainingPlan)
                .FirstOrDefaultAsync(r => r.Id == id && r.TrainingPlan!.UserId == CurrentUserId);

            if (race == null) return NotFound();

            race.Name = dto.Name;
            race.RaceDate = dto.RaceDate;
            race.DistanceMiles = dto.DistanceMiles;
            race.TargetTime = dto.TargetTime;
            // TrainingPlanId intentionally not editable — same reasoning as Workouts

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/races/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var race = await _context.Races
                .Include(r => r.TrainingPlan)
                .FirstOrDefaultAsync(r => r.Id == id && r.TrainingPlan!.UserId == CurrentUserId);

            if (race == null) return NotFound();

            _context.Races.Remove(race);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}