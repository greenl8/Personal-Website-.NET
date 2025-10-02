using System;
using System.ComponentModel.DataAnnotations;

namespace greenl8site.Models
{
    public class Media
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(500)]
        public string FilePath { get; set; } = string.Empty;
        
        [Required]
        [StringLength(50)]
        public string FileType { get; set; } = string.Empty;
        
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public int UploadedById { get; set; }
        
        // Navigation property
        public User? UploadedBy { get; set; } 
    }
}