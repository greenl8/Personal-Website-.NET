using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class PostCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
        
        public string FeaturedImage { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; }
        
        public List<int> CategoryIds { get; set; } = new List<int>();
        
        public List<int> TagIds { get; set; } = new List<int>();
    }
    
    public class PostUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Content { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
        
        public string FeaturedImage { get; set; } = string.Empty;
        
        public bool IsPublished { get; set; }
        
        public List<int> CategoryIds { get; set; } = new List<int>();
        
        public List<int> TagIds { get; set; } = new List<int>();
    }
    
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string FeaturedImage { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto? Author { get; set; }
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }
    
    public class PostListDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string FeaturedImage { get; set; } = string.Empty;
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string AuthorName { get; set; } = string.Empty;
    }
    
    public class PostFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool? IsPublished { get; set; }
        public int? CategoryId { get; set; }
        public int? TagId { get; set; }
        public string SearchTerm { get; set; } = string.Empty;
    }
}