using System;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Page
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        [Required]
        [StringLength(200)]
        public string Slug { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public int AuthorId { get; set; }
        
        // Navigation property
        public required User Author { get; set; }
    }
}