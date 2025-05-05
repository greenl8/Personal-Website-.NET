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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
            var page = new Page
            {
                Title = pageDto.Title,
                Content = pageDto.Content,
                Slug = slug,
                IsPublished = pageDto.IsPublished,
                AuthorId = userId,
                CreatedAt = DateTime.UtcNow,
                Author = (await _context.Users.FindAsync(userId))!,
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