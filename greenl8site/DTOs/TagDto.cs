using System.ComponentModel.DataAnnotations;

namespace greenl8site.DTOs
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
    }
    
    public class TagCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
    }
    
    public class TagUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        public string Slug { get; set; } = string.Empty;
    }
}