using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using greenl8site.DTOs;
using YourProjectName.Data;

namespace greenl8site.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
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
            try
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
                    TrafficData = Array.Empty<ChartDataPoint>()
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to load dashboard summary", details = ex.Message });
            }
        }

        [HttpGet("statistics")]
        public ActionResult<StatisticsData[]> GetStatistics([FromQuery] string interval = "days", [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
        {
            try
            {
                // No analytics implemented yet; return empty series
                return Ok(Array.Empty<StatisticsData>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to load statistics", details = ex.Message });
            }
        }

        // Removed mock statistics generator

        // Removed date formatting helper for mock data

        // Removed week number helper for mock data

        // Removed mock traffic generator

        // Removed mock view count generator

        [HttpGet("activities")]
        public ActionResult<ActivityLogDto[]> GetActivities()
        {
            try
            {
                // No activity feed implemented yet; return empty list
                return Ok(Array.Empty<ActivityLogDto>());
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to load activities", details = ex.Message });
            }
        }

        [HttpGet("status")]
        public ActionResult<SystemStatus> GetStatus()
        {
            try
            {
                // Return minimal neutral system status without mock values
                var status = new SystemStatus
                {
                    ServerStatus = "good",
                    ServerLoad = 0,
                    DatabaseStatus = "good",
                    StorageUsed = "0MB",
                    StorageTotal = "0MB",
                    StoragePercentage = 0,
                    Version = "1.0.0",
                    UpdateAvailable = false
                };

                return Ok(status);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to load system status", details = ex.Message });
            }
        }
    }
}
