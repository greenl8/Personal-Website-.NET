# Complete .NET & Angular CMS Implementation

## Backend (.NET Core)

### Models

**Models/User.cs**
```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Username { get; set; }
        
        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }
        
        [Required]
        public string PasswordHash { get; set; }
        
        [Required]
        public string Role { get; set; } // "Admin" or "User"
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public ICollection<Post> Posts { get; set; }
        public ICollection<Page> Pages { get; set; }
        public ICollection<Media> UploadedMedia { get; set; }
    }
}
```

**Models/Post.cs**
```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Post
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Slug { get; set; }
        
        public string FeaturedImage { get; set; }
        
        public bool IsPublished { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? PublishedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public int AuthorId { get; set; }
        
        // Navigation properties
        public User Author { get; set; }
        public ICollection<PostCategory> PostCategories { get; set; }
        public ICollection<PostTag> PostTags { get; set; }
    }
}
```

**Models/Page.cs**
```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Page
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Slug { get; set; }
        
        public bool IsPublished { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public int AuthorId { get; set; }
        
        // Navigation property
        public User Author { get; set; }
    }
}
```

**Models/Category.cs**
```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Category
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Slug { get; set; }
        
        // Navigation property
        public ICollection<PostCategory> PostCategories { get; set; }
    }
}
```

**Models/Tag.cs**
```csharp
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Tag
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Slug { get; set; }
        
        // Navigation property
        public ICollection<PostTag> PostTags { get; set; }
    }
}
```

**Models/Media.cs**
```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.Models
{
    public class Media
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(255)]
        public string FileName { get; set; }
        
        [Required]
        [StringLength(500)]
        public string FilePath { get; set; }
        
        [Required]
        [StringLength(50)]
        public string FileType { get; set; }
        
        public long FileSize { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public int UploadedById { get; set; }
        
        // Navigation property
        public User UploadedBy { get; set; }
    }
}
```

**Models/PostCategory.cs**
```csharp
namespace YourProjectName.Models
{
    public class PostCategory
    {
        public int PostId { get; set; }
        public Post Post { get; set; }
        
        public int CategoryId { get; set; }
        public Category Category { get; set; }
    }
}
```

**Models/PostTag.cs**
```csharp
namespace YourProjectName.Models
{
    public class PostTag
    {
        public int PostId { get; set; }
        public Post Post { get; set; }
        
        public int TagId { get; set; }
        public Tag Tag { get; set; }
    }
}
```

### Data Context

**Data/AppDbContext.cs**
```csharp
using Microsoft.EntityFrameworkCore;
using YourProjectName.Models;

namespace YourProjectName.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure many-to-many relationship between Post and Category
            modelBuilder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });
                
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Post)
                .WithMany(p => p.PostCategories)
                .HasForeignKey(pc => pc.PostId);
                
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.PostCategories)
                .HasForeignKey(pc => pc.CategoryId);
                
            // Configure many-to-many relationship between Post and Tag
            modelBuilder.Entity<PostTag>()
                .HasKey(pt => new { pt.PostId, pt.TagId });
                
            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Post)
                .WithMany(p => p.PostTags)
                .HasForeignKey(pt => pt.PostId);
                
            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.PostTags)
                .HasForeignKey(pt => pt.TagId);
                
            // Configure one-to-many relationships
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Page>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Pages)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Media>()
                .HasOne(m => m.UploadedBy)
                .WithMany(u => u.UploadedMedia)
                .HasForeignKey(m => m.UploadedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
```

### DTOs (Data Transfer Objects)

**DTOs/AuthDtos.cs**
```csharp
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class RegisterDto
    {
        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; }
        
        [Required]
        [EmailAddress]
        public string Email { get; set; }
        
        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; }
    }
    
    public class LoginDto
    {
        [Required]
        public string Username { get; set; }
        
        [Required]
        public string Password { get; set; }
    }
    
    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
    }
}
```

**DTOs/PostDtos.cs**
```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class PostCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public string Slug { get; set; }
        
        public string FeaturedImage { get; set; }
        
        public bool IsPublished { get; set; }
        
        public List<int> CategoryIds { get; set; } = new List<int>();
        
        public List<int> TagIds { get; set; } = new List<int>();
    }
    
    public class PostUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public string Slug { get; set; }
        
        public string FeaturedImage { get; set; }
        
        public bool IsPublished { get; set; }
        
        public List<int> CategoryIds { get; set; } = new List<int>();
        
        public List<int> TagIds { get; set; } = new List<int>();
    }
    
    public class PostDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Slug { get; set; }
        public string FeaturedImage { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto Author { get; set; }
        public List<CategoryDto> Categories { get; set; } = new List<CategoryDto>();
        public List<TagDto> Tags { get; set; } = new List<TagDto>();
    }
    
    public class PostListDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public string FeaturedImage { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string AuthorName { get; set; }
    }
    
    public class PostFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public bool? IsPublished { get; set; }
        public int? CategoryId { get; set; }
        public int? TagId { get; set; }
        public string SearchTerm { get; set; }
    }
}
```

**DTOs/PageDtos.cs**
```csharp
using System;
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class PageCreateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public string Slug { get; set; }
        
        public bool IsPublished { get; set; }
    }
    
    public class PageUpdateDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        public string Slug { get; set; }
        
        public bool IsPublished { get; set; }
    }
    
    public class PageDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Slug { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public UserDto Author { get; set; }
    }
    
    public class PageListDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Slug { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public string AuthorName { get; set; }
    }
}
```

**DTOs/CategoryDto.cs**
```csharp
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
    }
    
    public class CategoryCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Slug { get; set; }
    }
    
    public class CategoryUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Slug { get; set; }
    }
}
```

**DTOs/TagDto.cs**
```csharp
using System.ComponentModel.DataAnnotations;

namespace YourProjectName.DTOs
{
    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
    }
    
    public class TagCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Slug { get; set; }
    }
    
    public class TagUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        public string Slug { get; set; }
    }
}
```

**DTOs/MediaDto.cs**
```csharp
using System;
using Microsoft.AspNetCore.Http;

namespace YourProjectName.DTOs
{
    public class MediaDto
    {
        public int Id { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public string FileType { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
        public string UploadedBy { get; set; }
        public string Url { get; set; }
    }
    
    public class MediaFilterDto
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
        public string SearchTerm { get; set; }
        public string FileType { get; set; }
    }
    
    public class MediaUploadDto
    {
        public IFormFile File { get; set; }
    }
}
```

**DTOs/PaginatedResultDto.cs**
```csharp
using System.Collections.Generic;

namespace YourProjectName.DTOs
{
    public class PaginatedResultDto<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
}
```

### Services

**Services/TokenService.cs**
```csharp
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using YourProjectName.Models;

namespace YourProjectName.Services
{
    public class TokenService
    {
        private readonly IConfiguration _config;
        
        public TokenService(IConfiguration config)
        {
            _config = config;
        }
        
        public string CreateToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };
            
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                _config["TokenKey"]));
                
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512Signature);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.Now.AddDays(7),
                SigningCredentials = creds
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            return tokenHandler.WriteToken(token);
        }
    }
}
```

**Services/FileService.cs**
```csharp
using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace YourProjectName.Services
{
    public class FileService
    {
        private readonly string _uploadDirectory;
        private readonly string _baseUrl;
        
        public FileService(IConfiguration config)
        {
            _uploadDirectory = config["FileStorage:UploadDirectory"];
            _baseUrl = config["FileStorage:BaseUrl"];
            
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }
        
        public async Task<(string filePath, string fileName, long fileSize, string fileType)> SaveFileAsync(IFormFile file)
        {
            // Create a unique filename to prevent overwriting
            string fileExtension = Path.GetExtension(file.FileName);
            string fileName = $"{Guid.NewGuid()}{fileExtension}";
            
            // Determine file type (mime type)
            string fileType = file.ContentType;
            
            // Create year/month folders for better organization
            string dateFolder = DateTime.Now.ToString("yyyy/MM");
            string relativePath = Path.Combine(dateFolder, fileName);
            string fullPath = Path.Combine(_uploadDirectory, relativePath);
            
            // Ensure directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));
            
            // Save the file
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            return (relativePath, file.FileName, file.Length, fileType);
        }
        
        public string GetFileUrl(string filePath)
        {
            return $"{_baseUrl}/{filePath.Replace("\\", "/")}";
        }
        
        public bool DeleteFile(string filePath)
        {
            string fullPath = Path.Combine(_uploadDirectory, filePath);
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
            
            return false;
        }
    }
}
```

**Services/SlugService.cs**
```csharp
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace YourProjectName.Services
{
    public class SlugService
    {
        public string GenerateSlug(string text)
        {
            // Remove diacritics (accents)
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();
            
            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            
            // Convert to lowercase
            string slug = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLower();
            
            // Remove special characters
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            
            // Replace spaces with hyphens
            slug = Regex.Replace(slug, @"\s+", "-");
            
            // Remove multiple hyphens
            slug = Regex.Replace(slug, @"-+", "-");
            
            // Trim hyphens from beginning and end
            slug = slug.Trim('-');
            
            return slug;
        }
        
        public string EnsureUniqueSlug(string slug, Func<string, bool> exists)
        {
            string uniqueSlug = slug;
            int counter = 1;
            
            while (exists(uniqueSlug))
            {
                uniqueSlug = $"{slug}-{counter}";
                counter++;
            }
            
            return uniqueSlug;
        }
    }
}
```

### Controllers

**Controllers/PagesController.cs**
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly SlugService _slugService;
        
        public PagesController(AppDbContext context, IMapper mapper, SlugService slugService)
        {
            _context = context;
            _mapper = mapper;
            _slugService = slugService;
        }
        
        [HttpGet]
        public async Task<ActionResult<List<PageListDto>>> GetPages()
        {
            var pages = await _context.Pages
                .Include(p => p.Author)
                .OrderBy(p => p.Title)
                .ToListAsync();
                
            return _mapper.Map<List<PageListDto>>(pages);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<PageDto>> GetPage(int id)
        {
            var page = await _context.Pages
                .Include(p => p.Author)
                .SingleOrDefaultAsync(p => p.Id == id);
                
            if (page == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<PageDto>(page);
        }
        
        [HttpGet("by-slug/{slug}")]
        public async Task<ActionResult<PageDto>> GetPageBySlug(string slug)
        {
            var page = await _context.Pages
                .Include(p => p.Author)
                .SingleOrDefaultAsync(p => p.Slug == slug);
                
            if (page == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<PageDto>(page);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PageDto>> CreatePage(PageCreateDto pageDto)
        {
            // Generate slug if not provided
            string slug = pageDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(pageDto.Title);
            }
            
            // Ensure slug is unique
            slug = _slugService.EnsureUniqueSlug(slug, s => _context.Pages.Any(p => p.Slug == s));
            
            // Get current user as author
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            var page = new Page
            {
                Title = pageDto.Title,
                Content = pageDto.Content,
                Slug = slug,
                IsPublished = pageDto.IsPublished,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            _context.Pages.Add(page);
            await _context.SaveChangesAsync();
            
            return await GetPage(page.Id);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<PageDto>> UpdatePage(int id, PageUpdateDto pageDto)
        {
            var page = await _context.Pages.FindAsync(id);
            
            if (page == null)
            {
                return NotFound();
            }
            
            // Generate or validate slug
            string slug = pageDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(pageDto.Title);
            }
            
            // Ensure slug is unique (excluding current page)
            if (slug != page.Slug)
            {
                slug = _slugService.EnsureUniqueSlug(slug, s => _context.Pages.Any(p => p.Slug == s && p.Id != id));
            }
            
            // Update page properties
            page.Title = pageDto.Title;
            page.Content = pageDto.Content;
            page.Slug = slug;
            page.IsPublished = pageDto.IsPublished;
            page.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            return await GetPage(id);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePage(int id)
        {
            var page = await _context.Pages.FindAsync(id);
            
            if (page == null)
            {
                return NotFound();
            }
            
            _context.Pages.Remove(page);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
```

**Controllers/MediaController.cs**
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly FileService _fileService;
        
        public MediaController(AppDbContext context, IMapper mapper, FileService fileService)
        {
            _context = context;
            _mapper = mapper;
            _fileService = fileService;
        }
        
        [HttpGet]
        public async Task<ActionResult<PaginatedResultDto<MediaDto>>> GetMedia([FromQuery] MediaFilterDto filter)
        {
            var query = _context.Media
                .Include(m => m.UploadedBy)
                .OrderByDescending(m => m.UploadedAt)
                .AsQueryable();
                
            // Apply filters
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(m => m.FileName.ToLower().Contains(searchTerm));
            }
            
            if (!string.IsNullOrEmpty(filter.FileType))
            {
                query = query.Where(m => m.FileType.StartsWith(filter.FileType));
            }
            
            // Count total matches
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var mediaItems = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
                
            // Map to DTOs and add URLs
            var mediaDtos = _mapper.Map<List<MediaDto>>(mediaItems);
            
            foreach (var mediaDto in mediaDtos)
            {
                mediaDto.Url = _fileService.GetFileUrl(mediaDto.FilePath);
            }
            
            // Create paginated result
            var result = new PaginatedResultDto<MediaDto>
            {
                Items = mediaDtos,
                TotalCount = totalCount,
                CurrentPage = filter.Page,
                PageSize = filter.PageSize,
                PageCount = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };
            
            return result;
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<MediaDto>> UploadMedia([FromForm] MediaUploadDto uploadDto)
        {
            if (uploadDto.File == null || uploadDto.File.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }
            
            // Save file to storage
            var (filePath, fileName, fileSize, fileType) = await _fileService.SaveFileAsync(uploadDto.File);
            
            // Get current user
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            // Create media record
            var media = new Media
            {
                FileName = fileName,
                FilePath = filePath,
                FileType = fileType,
                FileSize = fileSize,
                UploadedById = userId
            };
            
            _context.Media.Add(media);
            await _context.SaveChangesAsync();
            
            // Map to DTO
            var mediaDto = _mapper.Map<MediaDto>(media);
            mediaDto.Url = _fileService.GetFileUrl(filePath);
            
            return mediaDto;
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteMedia(int id)
        {
            var media = await _context.Media.FindAsync(id);
            
            if (media == null)
            {
                return NotFound();
            }
            
            // Delete file from storage
            _fileService.DeleteFile(media.FilePath);
            
            // Delete database record
            _context.Media.Remove(media);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
```

**Controllers/CategoriesController.cs**
```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly SlugService _slugService;
        
        public CategoriesController(AppDbContext context, IMapper mapper, SlugService slugService)
        {
            _context = context;
            _mapper = mapper;
            _slugService = slugService;
        }
        
        [HttpGet]
        public async Task<ActionResult<List<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();
                
            return _mapper.Map<List<CategoryDto>>(categories);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            
            if (category == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<CategoryDto>(category);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<CategoryDto>> CreateCategory(CategoryCreateDto categoryDto)
        {
            // Generate slug if not provided
            string slug = categoryDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(categoryDto.Name);
            }
            
            // Ensure slug is unique
            slug = _slugService.EnsureUniqueSlug(slug, s => _context.Categories.Any(c => c.Slug == s));
            
            var category = new Category
            {
                Name = categoryDto.Name,
                Slug = slug
            };
            
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<CategoryDto>(category);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<CategoryDto>> UpdateCategory(int id, CategoryUpdateDto categoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            
            if (category == null)
            {
                return NotFound();
            }
            
            // Generate or validate slug
            string slug = categoryDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(categoryDto.Name);
            }
            
            // Ensure slug is unique (excluding current category)
            if (slug != category.Slug)
            {
                slug = _slugService.EnsureUniqueSlug(slug, s => _context.Categories.Any(c => c.Slug == s && c.Id != id));
            }
            
            // Update category properties
            category.Name = categoryDto.Name;
            category.Slug = slug;
            
            await _context.SaveChangesAsync();
            
            return _mapper.Map<CategoryDto>(category);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .Include(c => c.PostCategories)
                .SingleOrDefaultAsync(c => c.Id == id);
                
            if (category == null)
            {
                return NotFound();
            }
            
            // Check if category is in use
            if (category.PostCategories.Any())
            {
                return BadRequest("Cannot delete category that is associated with posts");
            }
            
            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
```

**Controllers/TagsController.cs**
```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly SlugService _slugService;
        
        public TagsController(AppDbContext context, IMapper mapper, SlugService slugService)
        {
            _context = context;
            _mapper = mapper;
            _slugService = slugService;
        }
        
        [HttpGet]
        public async Task<ActionResult<List<TagDto>>> GetTags()
        {
            var tags = await _context.Tags
                .OrderBy(t => t.Name)
                .ToListAsync();
                
            return _mapper.Map<List<TagDto>>(tags);
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<TagDto>> GetTag(int id)
        {
            var tag = await _context.Tags.FindAsync(id);
            
            if (tag == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<TagDto>(tag);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<TagDto>> CreateTag(TagCreateDto tagDto)
        {
            // Generate slug if not provided
            string slug = tagDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(tagDto.Name);
            }
            
            // Ensure slug is unique
            slug = _slugService.EnsureUniqueSlug(slug, s => _context.Tags.Any(t => t.Slug == s));
            
            var tag = new Tag
            {
                Name = tagDto.Name,
                Slug = slug
            };
            
            _context.Tags.Add(tag);
            await _context.SaveChangesAsync();
            
            return _mapper.Map<TagDto>(tag);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<TagDto>> UpdateTag(int id, TagUpdateDto tagDto)
        {
            var tag = await _context.Tags.FindAsync(id);
            
            if (tag == null)
            {
                return NotFound();
            }
            
            // Generate or validate slug
            string slug = tagDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(tagDto.Name);
            }
            
            // Ensure slug is unique (excluding current tag)
            if (slug != tag.Slug)
            {
                slug = _slugService.EnsureUniqueSlug(slug, s => _context.Tags.Any(t => t.Slug == s && t.Id != id));
            }
            
            // Update tag properties
            tag.Name = tagDto.Name;
            tag.Slug = slug;
            
            await _context.SaveChangesAsync();
            
            return _mapper.Map<TagDto>(tag);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTag(int id)
        {
            var tag = await _context.Tags
                .Include(t => t.PostTags)
                .SingleOrDefaultAsync(t => t.Id == id);
                
            if (tag == null)
            {
                return NotFound();
            }
            
            // Check if tag is in use
            if (tag.PostTags.Any())
            {
                return BadRequest("Cannot delete tag that is associated with posts");
            }
            
            _context.Tags.Remove(tag);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }
}
```

**Controllers/AuthController.cs**
```csharp
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFram

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher;
        
        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = new PasswordHasher<User>();
        }
        
        [HttpPost("register")]
        [Authorize(Roles = "Admin")] // Only admins can create new users
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username is already taken");
            }
            
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email is already taken");
            }
            
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Role = "User" // Default role
            };
            
            user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Username == loginDto.Username);
                
            if (user == null)
            {
                return Unauthorized("Invalid username");
            }
            
            var result = _passwordHasher.VerifyHashedPassword(
                user, user.PasswordHash, loginDto.Password);
                
            if (result != PasswordVerificationResult.Success)
            {
                return Unauthorized("Invalid password");
            }
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = _tokenService.CreateToken(user)
            };
        }
        
        [Authorize]
        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Username == username);
                
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = _tokenService.CreateToken(user)
            };
        }
    }
}
```

**Controllers/AuthController.cs**
```csharp
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly TokenService _tokenService;
        private readonly PasswordHasher<User> _passwordHasher;
        
        public AuthController(AppDbContext context, TokenService tokenService)
        {
            _context = context;
            _tokenService = tokenService;
            _passwordHasher = new PasswordHasher<User>();
        }
        
        [HttpPost("register")]
        [Authorize(Roles = "Admin")] // Only admins can create new users
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username is already taken");
            }
            
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email is already taken");
            }
            
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Role = "User" // Default role
            };
            
            user.PasswordHash = _passwordHasher.HashPassword(user, registerDto.Password);
            
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role
            };
        }
        
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
        {
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Username == loginDto.Username);
                
            if (user == null)
            {
                return Unauthorized("Invalid username");
            }
            
            var result = _passwordHasher.VerifyHashedPassword(
                user, user.PasswordHash, loginDto.Password);
                
            if (result != PasswordVerificationResult.Success)
            {
                return Unauthorized("Invalid password");
            }
            
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = _tokenService.CreateToken(user)
            };
        }
        
        [Authorize]
        [HttpGet("current")]
        public async Task<ActionResult<UserDto>> GetCurrentUser()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            
            var user = await _context.Users
                .SingleOrDefaultAsync(u => u.Username == username);
                
            return new UserDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role,
                Token = _tokenService.CreateToken(user)
            };
        }
    }
}
```

**Controllers/PostsController.cs**
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using YourProjectName.Data;
using YourProjectName.DTOs;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;
        private readonly SlugService _slugService;
        
        public PostsController(AppDbContext context, IMapper mapper, SlugService slugService)
        {
            _context = context;
            _mapper = mapper;
            _slugService = slugService;
        }
        
        [HttpGet]
        public async Task<ActionResult<PaginatedResultDto<PostListDto>>> GetPosts([FromQuery] PostFilterDto filter)
        {
            var query = _context.Posts
                .Include(p => p.Author)
                .AsQueryable();
                
            // Apply filters
            if (filter.IsPublished.HasValue)
            {
                query = query.Where(p => p.IsPublished == filter.IsPublished);
            }
            
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.PostCategories.Any(pc => pc.CategoryId == filter.CategoryId));
            }
            
            if (filter.TagId.HasValue)
            {
                query = query.Where(p => p.PostTags.Any(pt => pt.TagId == filter.TagId));
            }
            
            if (!string.IsNullOrEmpty(filter.SearchTerm))
            {
                var searchTerm = filter.SearchTerm.ToLower();
                query = query.Where(p => p.Title.ToLower().Contains(searchTerm) || 
                                         p.Content.ToLower().Contains(searchTerm));
            }
            
            // Default: order by created date descending (newest first)
            query = query.OrderByDescending(p => p.CreatedAt);
            
            // Count total matches
            var totalCount = await query.CountAsync();
            
            // Apply pagination
            var posts = await query
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();
                
            // Map to DTOs
            var postDtos = _mapper.Map<List<PostListDto>>(posts);
            
            // Create paginated result
            var result = new PaginatedResultDto<PostListDto>
            {
                Items = postDtos,
                TotalCount = totalCount,
                CurrentPage = filter.Page,
                PageSize = filter.PageSize,
                PageCount = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
            };
            
            return result;
        }
        
        [HttpGet("{id}")]
        public async Task<ActionResult<PostDto>> GetPost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.PostCategories)
                    .ThenInclude(pc => pc.Category)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .SingleOrDefaultAsync(p => p.Id == id);
                
            if (post == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<PostDto>(post);
        }
        
        [HttpGet("by-slug/{slug}")]
        public async Task<ActionResult<PostDto>> GetPostBySlug(string slug)
        {
            var post = await _context.Posts
                .Include(p => p.Author)
                .Include(p => p.PostCategories)
                    .ThenInclude(pc => pc.Category)
                .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                .SingleOrDefaultAsync(p => p.Slug == slug);
                
            if (post == null)
            {
                return NotFound();
            }
            
            return _mapper.Map<PostDto>(post);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<PostDto>> CreatePost(PostCreateDto postDto)
        {
            // Generate slug if not provided
            string slug = postDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(postDto.Title);
            }
            
            // Ensure slug is unique
            slug = _slugService.EnsureUniqueSlug(slug, s => _context.Posts.Any(p => p.Slug == s));
            
            // Get current user as author
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);
            
            var post = new Post
            {
                Title = postDto.Title,
                Content = postDto.Content,
                Slug = slug,
                FeaturedImage = postDto.FeaturedImage,
                IsPublished = postDto.IsPublished,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow
            };
            
            // Set published date if published
            if (post.IsPublished)
            {
                post.PublishedAt = DateTime.UtcNow;
            }
            
            _context.Posts.Add(post);
            await _context.SaveChangesAsync();
            
            // Add categories if any
            if (postDto.CategoryIds != null && postDto.CategoryIds.Any())
            {
                foreach (var categoryId in postDto.CategoryIds)
                {
                    if (await _context.Categories.AnyAsync(c => c.Id == categoryId))
                    {
                        _context.PostCategories.Add(new PostCategory
                        {
                            PostId = post.Id,
                            CategoryId = categoryId
                        });
                    }
                }
                
                await _context.SaveChangesAsync();
            }
            
            // Add tags if any
            if (postDto.TagIds != null && postDto.TagIds.Any())
            {
                foreach (var tagId in postDto.TagIds)
                {
                    if (await _context.Tags.AnyAsync(t => t.Id == tagId))
                    {
                        _context.PostTags.Add(new PostTag
                        {
                            PostId = post.Id,
                            TagId = tagId
                        });
                    }
                }
                
                await _context.SaveChangesAsync();
            }
            
            // Return the created post with all relations loaded
            return await GetPost(post.Id);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<ActionResult<PostDto>> UpdatePost(int id, PostUpdateDto postDto)
        {
            var post = await _context.Posts
                .Include(p => p.PostCategories)
                .Include(p => p.PostTags)
                .SingleOrDefaultAsync(p => p.Id == id);
                
            if (post == null)
            {
                return NotFound();
            }
            
            // Generate or validate slug
            string slug = postDto.Slug;
            if (string.IsNullOrEmpty(slug))
            {
                slug = _slugService.GenerateSlug(postDto.Title);
            }
            
            // Ensure slug is unique (excluding current post)
            if (slug != post.Slug)
            {
                slug = _slugService.EnsureUniqueSlug(slug, s => _context.Posts.Any(p => p.Slug == s && p.Id != id));
            }
            
            // Update post properties
            post.Title = postDto.Title;
            post.Content = postDto.Content;
            post.Slug = slug;
            post.FeaturedImage = postDto.FeaturedImage;
            post.UpdatedAt = DateTime.UtcNow;
            
            // Update published status if changed
            if (post.IsPublished != postDto.IsPublished)
            {
                post.IsPublished = postDto.IsPublished;
                
                if (post.IsPublished && !post.PublishedAt.HasValue)
                {
                    post.PublishedAt = DateTime.UtcNow;
                }
            }
            
            // Update categories
            if (postDto.CategoryIds != null)
            {
                // Remove existing categories not in the new list
                var categoriesToRemove = post.PostCategories
                    .Where(pc => !postDto.CategoryIds.Contains(pc.CategoryId))
                    .ToList();
                
                foreach (var categoryToRemove in categoriesToRemove)
                {
                    _context.PostCategories.Remove(categoryToRemove);
                }
                
                // Add new categories
                foreach (var categoryId in postDto.CategoryIds)
                {
                    if (!post.PostCategories.Any(pc => pc.CategoryId == categoryId) &&
                        await _context.Categories.AnyAsync(c => c.Id == categoryId))
                    {
                        _context.PostCategories.Add(new PostCategory
                        {
                            PostId = post.Id,
                            CategoryId = categoryId
                        });
                    }
                }
            }
            
            // Update tags
            if (postDto.TagIds != null)
            {
                // Remove existing tags not in the new list
                var tagsToRemove = post.PostTags
                    .Where(pt => !postDto.TagIds.Contains(pt.TagId))
                    .ToList();
                
                foreach (var tagToRemove in tagsToRemove)
                {
                    _context.PostTags.Remove(tagToRemove);
                }
                
                // Add new tags
                foreach (var tagId in postDto.TagIds)
                {
                    if (!post.PostTags.Any(pt => pt.TagId == tagId) &&
                        await _context.Tags.AnyAsync(t => t.Id == tagId))
                    {
                        _context.PostTags.Add(new PostTag
                        {
                            PostId = post.Id,
                            TagId = tagId
                        });
                    }
                }
            }
            
            await _context.SaveChangesAsync();
            
            // Return the updated post
            return await GetPost(id);
        }
        
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePost(int id)
        {
            var post = await _context.Posts
                .Include(p => p.PostCategories)
                .Include(p => p.PostTags)
                .SingleOrDefaultAsync(p => p.Id == id);
                
            if (post == null)
            {
                return NotFound();
            }
            
            // Remove associated relations first
            _context.PostCategories.RemoveRange(post.PostCategories);
            _context.PostTags.RemoveRange(post.PostTags);
            
            // Remove the post
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();
            
            return NoContent();
        }
    }