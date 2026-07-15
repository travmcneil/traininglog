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
    public class ShoesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ShoesController(ApplicationDbContext context)
        {
            _context = context;
        }

        private string CurrentUserId =>
            User.FindFirstValue(ClaimTypes.NameIdentifier)!;

        // GET: api/shoes
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shoes = await _context.Shoes
                .Where(s => s.UserId == CurrentUserId)
                .Select(s => new ShoeDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    DateAcquired = s.DateAcquired,
                    Retired = s.Retired,
                    TotalMileage = s.Workouts
                        .Where(w => w.ActualDistanceMiles.HasValue)
                        .Sum(w => w.ActualDistanceMiles!.Value)
                })
                .OrderBy(s => s.Retired) // active shoes first
                .ThenByDescending(s => s.DateAcquired)
                .ToListAsync();

            return Ok(shoes);
        }

        // GET: api/shoes/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var shoe = await _context.Shoes
                .Where(s => s.Id == id && s.UserId == CurrentUserId)
                .Select(s => new ShoeDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    DateAcquired = s.DateAcquired,
                    Retired = s.Retired,
                    TotalMileage = s.Workouts
                        .Where(w => w.ActualDistanceMiles.HasValue)
                        .Sum(w => w.ActualDistanceMiles!.Value)
                })
                .FirstOrDefaultAsync();

            if (shoe == null) return NotFound();

            return Ok(shoe);
        }

        // POST: api/shoes
        [HttpPost]
        public async Task<IActionResult> Create(CreateShoeDto dto)
        {
            var shoe = new Shoe
            {
                Name = dto.Name,
                DateAcquired = dto.DateAcquired,
                Retired = dto.Retired,
                UserId = CurrentUserId
            };

            _context.Shoes.Add(shoe);
            await _context.SaveChangesAsync();

            var result = new ShoeDto
            {
                Id = shoe.Id,
                Name = shoe.Name,
                DateAcquired = shoe.DateAcquired,
                Retired = shoe.Retired,
                TotalMileage = 0 // brand new shoe, no workouts yet
            };

            return CreatedAtAction(nameof(GetById), new { id = shoe.Id }, result);
        }

        // PUT: api/shoes/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateShoeDto dto)
        {
            var shoe = await _context.Shoes
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);

            if (shoe == null) return NotFound();

            shoe.Name = dto.Name;
            shoe.DateAcquired = dto.DateAcquired;
            shoe.Retired = dto.Retired;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE: api/shoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var shoe = await _context.Shoes
                .FirstOrDefaultAsync(s => s.Id == id && s.UserId == CurrentUserId);

            if (shoe == null) return NotFound();

            _context.Shoes.Remove(shoe);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}