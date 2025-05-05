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
                Slug = slug,
                PostCategories = new List<PostCategory>()
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