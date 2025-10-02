using System;
using System.ComponentModel.DataAnnotations;

namespace greenl8site.DTOs
{
    public class PageCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; }
    }
    
    public class PageUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; }
    }
    
    public class PageDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto? Author { get; set; }
    }
    
    public class PageListDto
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? Slug { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
}