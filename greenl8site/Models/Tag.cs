using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Tag
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string Slug { get; set; } = string.Empty;
        
        // Navigation property
        public required ICollection<PostTag> PostTags { get; set; }
    }
}