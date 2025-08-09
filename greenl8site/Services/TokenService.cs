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
            
            var tokenKey = EnvironmentService.GetResolvedValue(_config, "TokenKey")
                ?? throw new InvalidOperationException("TokenKey is not configured");
            var tokenKeyBytes = Encoding.UTF8.GetBytes(tokenKey);
            if (tokenKeyBytes.Length < 16)
            {
                throw new ArgumentOutOfRangeException(nameof(tokenKey),
                    $"TokenKey must be at least 16 bytes (128 bits) for HMAC-SHA512. Current length: {tokenKeyBytes.Length} bytes. Configure a longer TOKEN_KEY.");
            }
            var key = new SymmetricSecurityKey(tokenKeyBytes);
                
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(300),
                SigningCredentials = creds
            };
            
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            
            return tokenHandler.WriteToken(token);
        }
    }
}