using System;
using Microsoft.AspNetCore.Http;

namespace YourProjectName.DTOs
{
    public class MediaDto
    {
        public int Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
    }
    
    public class MediaFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SearchTerm { get; set; } = string.Empty;
        public string FileType { get; set; } = string.Empty;
    }
    
    public class MediaUploadDto
    {
        public IFormFile? File { get; set; } 
    }
}