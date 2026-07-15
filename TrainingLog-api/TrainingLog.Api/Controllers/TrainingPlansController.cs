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
    [Authorize] // requires a valid JWT for every action in this controller
    public class TrainingPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrainingPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET: api/trainingplans
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await _context.TrainingPlans
                .Where(p => p.UserId == CurrentUserId)
                .Select(p => new TrainingPlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    StartDate = p.StartDate,
                    DurationWeeks = p.DurationWeeks,
                    IsActive = p.IsActive
                })
                .ToListAsync();

            return Ok(plans);
        }

        // GET: api/trainingplans/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _context.TrainingPlans
                .Where(p => p.Id == id && p.UserId == CurrentUserId)
                .Select(p => new TrainingPlanDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    StartDate = p.StartDate,
                    DurationWeeks = p.DurationWeeks,
                    IsActive = p.IsActive
                })
                .FirstOrDefaultAsync();

            if (plan == null) return NotFound();

            return Ok(plan);
        }

        // POST: api/trainingplans
        [HttpPost]
        public async Task<IActionResult> Create(CreateTrainingPlanDto dto)
        {
            var plan = new TrainingPlan
            {
                Name = dto.Name,
                StartDate = dto.StartDate,
                DurationWeeks = dto.DurationWeeks,
                UserId = CurrentUserId,
                IsActive = true
            };

            _context.TrainingPlans.Add(plan);
            await _context.SaveChangesAsync();

            var result = new TrainingPlanDto
            {
                Id = plan.Id,
                Name = plan.Name,
                StartDate = plan.StartDate,
                DurationWeeks = plan.DurationWeeks,
                IsActive = plan.IsActive
            };

            return CreatedAtAction(nameof(GetById), new { id = plan.Id }, result);
        }

        // PUT: api/trainingplans/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateTrainingPlanDto dto)
        {
            var plan = await _context.TrainingPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == CurrentUserId);

            if (plan == null) return NotFound();

            plan.Name = dto.Name;
            plan.StartDate = dto.StartDate;
            plan.DurationWeeks = dto.DurationWeeks;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/trainingplans/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var plan = await _context.TrainingPlans
                .FirstOrDefaultAsync(p => p.Id == id && p.UserId == CurrentUserId);

            if (plan == null) return NotFound();

            _context.TrainingPlans.Remove(plan);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}