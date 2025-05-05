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
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            
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