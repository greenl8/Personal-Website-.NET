using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace greenl8site.Models
{
    public class Post
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
        
        public string FeaturedImage { get; set; } = string.Empty;
        
        public string VideoEmbedCode { get; set; } = string.Empty;
        
        public string Excerpt { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? PublishedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public int AuthorId { get; set; }
        
        // Navigation properties
        public required User Author { get; set; }
        public required ICollection<PostCategory> PostCategories { get; set; }
        public required ICollection<PostTag> PostTags { get; set; }
    }
}