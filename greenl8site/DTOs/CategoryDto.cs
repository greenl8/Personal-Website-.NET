using System.ComponentModel.DataAnnotations;

namespace greenl8site.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }
    
    public class CategoryCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
    }
    
    public class CategoryUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
    }
}