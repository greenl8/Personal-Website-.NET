using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using greenl8site.DTOs;
using YourProjectName.Data;

namespace greenl8site.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummary>> GetSummary()
        {
            var summary = new DashboardSummary
            {
                PostCount = await _context.Posts.CountAsync(),
                DraftCount = await _context.Posts.CountAsync(p => !p.IsPublished),
                PageCount = await _context.Pages.CountAsync(),
                CommentCount = 0, // Implement when comments are added
                PendingCommentCount = 0,
                UserCount = await _context.Users.CountAsync(),
                NewUserCount = await _context.Users.CountAsync(u => u.CreatedAt >= DateTime.UtcNow.AddDays(-7)),
                ViewCount = 0,
                RecentDrafts = await _context.Posts
                    .Where(p => !p.IsPublished)
                    .OrderByDescending(p => p.UpdatedAt)
                    .Take(5)
                    .Select(p => new PostListItemDto 
                    {
                        Id = p.Id,
                        Title = p.Title,
                        UpdatedAt = p.UpdatedAt ?? DateTime.MinValue
                    })
                    .ToArrayAsync(),
                RecentComments = Array.Empty<CommentDto>(),
                TrafficData = GenerateEmptyTrafficData()
            };

            return Ok(summary);
        }

        private ChartDataPoint[] GenerateEmptyTrafficData()
        {
            var now = DateTime.UtcNow;
            return Enumerable.Range(0, 7)
                .Select(i => new ChartDataPoint
                {
                    Label = now.AddDays(-i).ToString("MM/dd"),
                    Value = 0
                })
                .Reverse()
                .ToArray();
        }

        [HttpGet("activities")]
        public ActionResult<ActivityLogDto[]> GetActivities()
        {
            // Return empty array for now - implement activity logging as needed
            return new ActivityLogDto[] { };
        }

        [HttpGet("status")]
        public ActionResult<SystemStatus> GetStatus()
        {
            var status = new SystemStatus
            {
                ServerStatus = "good",
                DatabaseStatus = "good",
                StorageUsed = "0",
                StorageTotal = "1GB",
                Version = "1.0.0"
            };

            return Ok(status);
        }
    }
}
