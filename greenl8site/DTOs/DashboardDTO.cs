using System;

namespace greenl8site.DTOs
{
    public class DashboardSummary
    {
        public int PostCount { get; set; }
        public int DraftCount { get; set; }
        public int PageCount { get; set; }
        public int CommentCount { get; set; }
        public int PendingCommentCount { get; set; }
        public int UserCount { get; set; }
        public int NewUserCount { get; set; }
        public int ViewCount { get; set; }
        public PostListItemDto[]? RecentDrafts { get; set; }  // Fix: Changed from string.Empty to nullable array
        public CommentDto[]? RecentComments { get; set; }
        public ChartDataPoint[]? TrafficData { get; set; }
    }

    public class SystemStatus
    {
        public string ServerStatus { get; set; } = string.Empty;
        public double ServerLoad { get; set; }
        public string DatabaseStatus { get; set; } = string.Empty;
        public string StorageUsed { get; set; } = string.Empty;
        public string StorageTotal { get; set; } = string.Empty;
        public double StoragePercentage { get; set; }
        public string Version { get; set; } = string.Empty;
        public bool UpdateAvailable { get; set; }
    }

    public class ActivityLogDto
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string User { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public int EntityId { get; set; }
        public string EntityType { get; set; } = string.Empty;
    }

    public class ChartDataPoint
    {
        public string Label { get; set; } = string.Empty;
        public double Value { get; set; }
    }

    public class PostListItemDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTime UpdatedAt { get; set; }
    }

    public class CommentDto
    {
        public int Id { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
