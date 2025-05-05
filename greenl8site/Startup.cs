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
using YourProjectName.Data;
using YourProjectName.Services;

namespace YourProjectName
{
    public class Startup
    {
        private readonly IConfiguration _config;
        
        public Startup(IConfiguration config)
        {
            _config = config;
        }
        
        public void ConfigureServices(IServiceCollection services)
        {
            // Add DbContext
            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_config.GetConnectionString("DefaultConnection")));
                
            // Add AutoMapper
            services.AddAutoMapper(typeof(MappingProfiles));
            
            // Add services
            services.AddScoped<TokenService>();
            services.AddScoped<FileService>();
            services.AddScoped<SlugService>();
            
            // Add authentication
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(
                        _config["TokenKey"] ?? throw new InvalidOperationException("TokenKey is not configured in application settings")
                        )),
                        ValidateIssuer = false,
                        ValidateAudience = false
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
                          .AllowAnyMethod()
                          .WithOrigins("http://localhost:4200"); // Angular development server
                });
            });
            
            // Add Swagger
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "YourProjectName API", Version = "v1" });
                
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
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "YourProjectName API v1"));
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