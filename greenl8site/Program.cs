using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using YourProjectName.Data;
using YourProjectName.Models;

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
                    await context.Database.MigrateAsync();
                    await SeedData(context);
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
                
        private static async Task SeedData(AppDbContext context)
        {
            // Check if admin user exists
            if (!await context.Users.AnyAsync())
            {
                // Create admin user
                var passwordHasher = new PasswordHasher<User>();
                
                var adminUser = new User
                {
                    Username = "admin",
                    Email = "admin@example.com",
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow
                };
                
                adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin123!");
                
                context.Users.Add(adminUser);

                var testUser = new User
                {
                    Username = "testuser",
                    Email = "testuser@example.com",
                    Role = "User",
                    CreatedAt = DateTime.UtcNow
                };
                    testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Test123!");
                    context.Users.Add(testUser);

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

    // Seed Posts
    if (!await context.Posts.AnyAsync())
    {
        var adminUser = await context.Users.FirstOrDefaultAsync(u => u.Username == "admin");
        var techCategory = await context.Categories.FirstOrDefaultAsync(c => c.Name == "Technology");
        if (techCategory == null)
        {
            throw new InvalidOperationException("Technology category not found. Please ensure the category is seeded correctly.");
        }

        if (adminUser == null)
        {
            throw new InvalidOperationException("Admin user not found. Please ensure the admin user is seeded correctly.");
        }

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