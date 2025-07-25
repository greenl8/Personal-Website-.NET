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
                    ViewCount = GenerateRandomViewCount(),
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
                    TrafficData = GenerateTrafficData()
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
                var start = startDate ?? DateTime.UtcNow.AddDays(-7);
                var end = endDate ?? DateTime.UtcNow;
                
                var data = GenerateStatisticsData(start, end, interval);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Failed to load statistics", details = ex.Message });
            }
        }

        private StatisticsData[] GenerateStatisticsData(DateTime startDate, DateTime endDate, string interval)
        {
            var data = new List<StatisticsData>();
            var random = new Random();
            var currentDate = startDate;

            while (currentDate <= endDate)
            {
                // Generate realistic random data with patterns
                var baseViews = 450 + random.Next(200);
                var baseVisitors = (int)(baseViews * (0.6 + random.NextDouble() * 0.3));
                var baseLikes = (int)(baseViews * (0.05 + random.NextDouble() * 0.1));
                var baseComments = (int)(baseViews * (0.02 + random.NextDouble() * 0.05));

                // Add weekly patterns (lower on weekends)
                var dayOfWeek = (int)currentDate.DayOfWeek;
                var weekendMultiplier = (dayOfWeek == 0 || dayOfWeek == 6) ? 0.7 : 1.2;

                data.Add(new StatisticsData
                {
                    Views = (int)(baseViews * weekendMultiplier),
                    Visitors = (int)(baseVisitors * weekendMultiplier),
                    Likes = (int)(baseLikes * weekendMultiplier),
                    Comments = (int)(baseComments * weekendMultiplier),
                    Date = FormatDateForInterval(currentDate, interval)
                });

                // Increment date based on interval
                currentDate = interval switch
                {
                    "days" => currentDate.AddDays(1),
                    "weeks" => currentDate.AddDays(7),
                    "months" => currentDate.AddMonths(1),
                    "years" => currentDate.AddYears(1),
                    _ => currentDate.AddDays(1)
                };
            }

            return data.ToArray();
        }

        private string FormatDateForInterval(DateTime date, string interval)
        {
            return interval switch
            {
                "days" => date.ToString("MMM dd"),
                "weeks" => $"Week {GetWeekNumber(date)}",
                "months" => date.ToString("MMM yyyy"),
                "years" => date.ToString("yyyy"),
                _ => date.ToString("MMM dd")
            };
        }

        private int GetWeekNumber(DateTime date)
        {
            var firstDayOfYear = new DateTime(date.Year, 1, 1);
            var pastDaysOfYear = (date - firstDayOfYear).Days;
            return (pastDaysOfYear + (int)firstDayOfYear.DayOfWeek + 1) / 7;
        }

        private ChartDataPoint[] GenerateTrafficData()
        {
            var random = new Random();
            var now = DateTime.UtcNow;
            return Enumerable.Range(0, 7)
                .Select(i => new ChartDataPoint
                {
                    Label = now.AddDays(-i).ToString("MM/dd"),
                    Value = random.Next(200, 800)
                })
                .Reverse()
                .ToArray();
        }

        private int GenerateRandomViewCount()
        {
            var random = new Random();
            return random.Next(100, 1000);
        }

        [HttpGet("activities")]
        public ActionResult<ActivityLogDto[]> GetActivities()
        {
            try
            {
                // Generate sample activities for demo
                var activities = new[]
                {
                    new ActivityLogDto
                    {
                        Id = 1,
                        Type = "post_created",
                        User = "Admin",
                        Message = "Created new post",
                        Timestamp = DateTime.UtcNow.AddHours(-2),
                        EntityId = 1,
                        EntityType = "Post"
                    },
                    new ActivityLogDto
                    {
                        Id = 2,
                        Type = "page_updated",
                        User = "Admin", 
                        Message = "Updated page content",
                        Timestamp = DateTime.UtcNow.AddHours(-5),
                        EntityId = 2,
                        EntityType = "Page"
                    }
                };

                return Ok(activities);
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
                var random = new Random();
                var status = new SystemStatus
                {
                    ServerStatus = "good",
                    ServerLoad = random.Next(20, 60),
                    DatabaseStatus = "good",
                    StorageUsed = "245MB",
                    StorageTotal = "1GB",
                    StoragePercentage = random.Next(20, 40),
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
