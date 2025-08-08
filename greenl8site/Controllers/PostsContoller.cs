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
        private readonly FileService _fileService;
        
        public PostsController(AppDbContext context, IMapper mapper, SlugService slugService, FileService fileService)
        {
            _context = context;
            _mapper = mapper;
            _slugService = slugService;
            _fileService = fileService;
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
                query = query.Where(p => p.IsPublished == filter.IsPublished.Value);
            }
            
            if (filter.CategoryId.HasValue)
            {
                query = query.Where(p => p.PostCategories.Any(pc => pc.CategoryId == filter.CategoryId.Value));
            }
            
            if (filter.TagId.HasValue)
            {
                query = query.Where(p => p.PostTags.Any(pt => pt.TagId == filter.TagId.Value));
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
            
            // Convert featured image paths to full URLs
            foreach (var postDto in postDtos)
            {
                if (!string.IsNullOrEmpty(postDto.FeaturedImage))
                {
                    postDto.FeaturedImage = _fileService.GetFileUrl(postDto.FeaturedImage);
                }
            }
            
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
            
            var postDto = _mapper.Map<PostDto>(post);
            
            // Convert featured image path to full URL
            if (!string.IsNullOrEmpty(postDto.FeaturedImage))
            {
                postDto.FeaturedImage = _fileService.GetFileUrl(postDto.FeaturedImage);
            }
            
            return postDto;
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
            
            var postDto = _mapper.Map<PostDto>(post);
            
            // Convert featured image path to full URL
            if (!string.IsNullOrEmpty(postDto.FeaturedImage))
            {
                postDto.FeaturedImage = _fileService.GetFileUrl(postDto.FeaturedImage);
            }
            
            return postDto;
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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var post = new Post
            {
                Title = postDto.Title,
                Content = postDto.Content,
                Slug = slug,
                FeaturedImage = postDto.FeaturedImage,
                VideoEmbedCode = postDto.VideoEmbedCode,
                Excerpt = postDto.Excerpt,
                IsPublished = postDto.IsPublished,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow,
                Author = (await _context.Users.FindAsync(userId))!,
                PostCategories = new List<PostCategory>(),
                PostTags = new List<PostTag>()
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
            post.VideoEmbedCode = postDto.VideoEmbedCode;
            post.Excerpt = postDto.Excerpt;
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

        [Authorize(Roles = "Admin")]
        [HttpPatch("{id}/toggle-publish")]
        public async Task<ActionResult<PostDto>> TogglePublishStatus(int id)
        {
            var post = await _context.Posts
                .SingleOrDefaultAsync(p => p.Id == id);
                
            if (post == null)
            {
                return NotFound();
            }
            
            // Toggle the published status
            post.IsPublished = !post.IsPublished;
            
            // Update PublishedAt date if being published for the first time
            if (post.IsPublished && !post.PublishedAt.HasValue)
            {
                post.PublishedAt = DateTime.UtcNow;
            }
            
            post.UpdatedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();
            
            // Return the updated post
            return await GetPost(id);
        }
    }
}