using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace greenl8site.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = string.Empty; // "Admin" or "User"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Post>? Posts { get; set; }
        public ICollection<Page>? Pages { get; set; }
        public ICollection<Media>? UploadedMedia { get; set; }
    }
}