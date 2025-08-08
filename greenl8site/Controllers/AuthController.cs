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
        public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
        {
            if (await _context.Users.AnyAsync(u => EF.Functions.ILike(u.Username, registerDto.Username)))
            {
                return BadRequest("Username is already taken");
            }
            
            if (await _context.Users.AnyAsync(u => EF.Functions.ILike(u.Email, registerDto.Email)))
            {
                return BadRequest("Email is already taken");
            }
            
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                Role = "Admin" // Default role
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
                .FirstOrDefaultAsync(u => EF.Functions.ILike(u.Username, loginDto.Username));
                
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
                .SingleOrDefaultAsync(u => EF.Functions.ILike(u.Username, username!));
                
                if (user == null)
                {
                    return Unauthorized("User not found");
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
    }
}