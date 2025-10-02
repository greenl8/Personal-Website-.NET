using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using greenl8site.Data;
using greenl8site.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace greenl8site
{
    public class Startup
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;
        
        public Startup(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            // Add DbContext - use PostgreSQL in production, SQLite in development
            var connectionString = EnvironmentService.GetResolvedConnectionString(_config, "DefaultConnection");
            
            if (connectionString?.Contains("Data Source=") == true)
            {
                // SQLite for development
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseSqlite(connectionString);
                    
                    if (_env.IsDevelopment())
                    {
                        options.EnableSensitiveDataLogging();
                        options.EnableDetailedErrors();
                    }
                });
            }
            else if (!string.IsNullOrEmpty(connectionString))
            {
                // PostgreSQL for production (Fly.io, Railway, Render, etc.)
                services.AddDbContext<AppDbContext>(options =>
                {
                    options.UseNpgsql(connectionString, npgsqlOptions =>
                    {
                        // Enable retry on failure for better resilience
                        npgsqlOptions.EnableRetryOnFailure(
                            maxRetryCount: _config.GetValue("Database:MaxRetryCount", 3),
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorCodesToAdd: null);
                        
                        // Set command timeout
                        npgsqlOptions.CommandTimeout(_config.GetValue("Database:CommandTimeout", 30));
                    });
                    
                    // Configure logging based on environment
                    if (_env.IsDevelopment())
                    {
                        options.EnableSensitiveDataLogging();
                        options.EnableDetailedErrors();
                    }
                    else
                    {
                        // Production: disable sensitive data logging for security
                        options.EnableSensitiveDataLogging(_config.GetValue("Database:EnableSensitiveDataLogging", false));
                    }
                });
            }
            else
            {
                throw new InvalidOperationException("No valid database connection string found.");
            }
                
            // Add AutoMapper
            services.AddAutoMapper(typeof(MappingProfiles));
            
            // Add services
            services.AddScoped<TokenService>();
            services.AddScoped<FileService>();
            services.AddScoped<SlugService>();
            
            // Handle environment variable substitution for TokenKey
            var tokenKey = EnvironmentService.GetResolvedValue(_config, "TokenKey");
            
            // Debug logging for TokenKey configuration
            Console.WriteLine($"TokenKey from config: {(!string.IsNullOrEmpty(_config["TokenKey"]) ? "SET" : "NOT SET")}");
            Console.WriteLine($"TOKEN_KEY environment variable: {(!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("TOKEN_KEY")) ? "SET" : "NOT SET")}");
            Console.WriteLine($"Resolved TokenKey: {(!string.IsNullOrEmpty(tokenKey) ? "HAS VALUE" : "NULL/EMPTY")}");
            
            if (string.IsNullOrEmpty(tokenKey))
            {
                throw new InvalidOperationException("TokenKey is not configured in application settings. Please ensure TOKEN_KEY environment variable is set or TokenKey is configured in appsettings.json");
            }
            
            // Add authentication
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(tokenKey)),
                        ValidateIssuer = false,
                        ValidateAudience = false,
                        RoleClaimType = ClaimTypes.Role,
                        // Add clock skew tolerance to allow for slight time differences between servers
                        ClockSkew = TimeSpan.Zero
                    };
                    
                    // Add events for debugging authentication issues
                    options.Events = new JwtBearerEvents
                    {
                        OnAuthenticationFailed = context => 
                        {
                            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
                            return Task.CompletedTask;
                        },
                        OnTokenValidated = context =>
                        {
                            Console.WriteLine("Token validated successfully");
                            var claims = context.Principal?.Claims;
                            if (claims != null)
                            {
                                foreach (var claim in claims)
                                {
                                    Console.WriteLine($"Claim: {claim.Type} = {claim.Value}");
                                }
                            }
                            return Task.CompletedTask;
                        },
                        OnChallenge = context =>
                        {
                            Console.WriteLine($"OnChallenge: {context.Error}, {context.ErrorDescription}");
                            return Task.CompletedTask;
                        }
                    };
                });
                
            // Add controllers
            services.AddControllers();
            
            // Add CORS
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyHeader()
                          .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                          .AllowCredentials()
                          .WithOrigins(
                              "http://localhost:4200",  // Default Angular port
                              "http://localhost:4201",  // Alternative Angular port
                              "http://192.168.0.81:4200", // Mobile access
                              "https://your-app-name.azurewebsites.net",
                              "https://greenl8site.onrender.com" // Add your Azure URL here
                          );
                });
            });
            
            // Add Swagger
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "greenl8site API", Version = "v1" });
                
                // Add JWT Authentication to Swagger
                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });
                
                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });
        }
        
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "greenl8site API v1"));
            }
            
            app.UseRouting();
            
            app.UseCors("CorsPolicy");
            
            app.UseAuthentication();
            app.UseAuthorization();
            
            // Serve static files for media uploads
            app.UseStaticFiles();
            
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                
                // Fallback to Angular app for any unmatched routes
                endpoints.MapFallbackToFile("index.html");
            });
        }
    }
}