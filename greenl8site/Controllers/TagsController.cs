using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using greenl8site.Data;
using greenl8site.DTOs;
using greenl8site.Models;
using greenl8site.Services;

namespace greenl8site.Controllers
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
                Slug = slug,
                PostTags = new List<PostTag>()
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