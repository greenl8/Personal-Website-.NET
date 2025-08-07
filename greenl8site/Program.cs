using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using YourProjectName.Data;
using YourProjectName.Models;
using YourProjectName.Services;

namespace YourProjectName
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();
            
            // Seed database on startup
            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                
                try
                {
                    var context = services.GetRequiredService<AppDbContext>();
                    var configuration = services.GetRequiredService<IConfiguration>();
                    var environment = services.GetRequiredService<IWebHostEnvironment>();
                    
                    await context.Database.MigrateAsync();
                    await SeedData(context, configuration, environment);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred during migration");
                }
            }
            
            await host.RunAsync();
        }
        
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
                
        private static async Task SeedData(AppDbContext context, IConfiguration configuration, IWebHostEnvironment environment)
        {
            // Create admin user if none exists
            if (!await context.Users.AnyAsync())
            {
                var passwordHasher = new PasswordHasher<User>();
                
                // Get admin credentials from configuration with environment variable resolution
                var adminUsername = EnvironmentService.GetResolvedValue(configuration, "AdminUser:Username") ?? "admin";
                var adminEmail = EnvironmentService.GetResolvedValue(configuration, "AdminUser:Email") ?? "admin@example.com";
                var adminPassword = EnvironmentService.GetResolvedValue(configuration, "AdminUser:Password") ?? "Admin123!";
                
                var adminUser = new User
                {
                    Username = adminUsername,
                    Email = adminEmail,
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                
                adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, adminPassword);
                context.Users.Add(adminUser);

                // Only create test user in development
                if (environment.IsDevelopment())
                {
                    var testUser = new User
                    {
                        Username = "testuser",
                        Email = "testuser@example.com",
                        Role = "User",
                        CreatedAt = DateTime.UtcNow
                    };
                    testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Test123!");
                    context.Users.Add(testUser);
                }

                await context.SaveChangesAsync();
            }
            
            // Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                context.Categories.AddRange(
                    new Category { Name = "Technology", Slug = "technology", PostCategories = new List<PostCategory>() },
                    new Category { Name = "Lifestyle", Slug = "lifestyle", PostCategories = new List<PostCategory>() }
                );
                await context.SaveChangesAsync();
            }

            // Seed Tags
            if (!await context.Tags.AnyAsync())
            {
                context.Tags.AddRange(
                    new Tag { Name = "ASP.NET", Slug = "asp-net", PostTags = new List<PostTag>() },
                    new Tag { Name = "Angular", Slug = "angular", PostTags = new List<PostTag>() }
                );
                await context.SaveChangesAsync();
            }

            // Only seed sample posts in development environment
            if (environment.IsDevelopment() && !await context.Posts.AnyAsync())
            {
                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
                var techCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Technology");
                
                if (techCategory != null && adminUser != null)
                {
                    var post = new Post
                    {
                        Title = "Getting Started with ASP.NET Core",
                        Content = "This is a sample post about ASP.NET Core.",
                        Slug = "getting-started-with-asp-net-core",
                        IsPublished = true,
                        CreatedAt = DateTime.UtcNow,
                        AuthorId = adminUser.Id,
                        PostCategories = new List<PostCategory>
                        {
                            new PostCategory { CategoryId = techCategory.Id }
                        },
                        PostTags = new List<PostTag>
                        {
                            new PostTag 
                            { 
                                TagId = (await context.Tags.FirstOrDefaultAsync(t => t.Name == "ASP.NET"))?.Id 
                                    ?? throw new InvalidOperationException("ASP.NET tag not found. Please ensure the tag is seeded correctly.") 
                            }
                        },
                        Author = adminUser
                    };

                    context.Posts.Add(post);
                    await context.SaveChangesAsync();
                }
            }
        }
        
    }
}