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
using System.Collections.Generic; // Added for List<PostCategory> and List<PostTag>
using System.Linq; // Added for AnyAsync and FirstOrDefaultAsync
using Npgsql; // Added for Npgsql.PostgresException

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
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    
                    // Check if database exists and is accessible
                    bool canConnect = await context.Database.CanConnectAsync();
                    logger.LogInformation($"Database connection test: {(canConnect ? "SUCCESS" : "FAILED")}");
                    
                    if (canConnect)
                    {
                        // Try to migrate, but handle specific migration conflicts
                        try
                        {
                            await context.Database.MigrateAsync();
                            logger.LogInformation("Database migration completed successfully");
                        }
                        catch (Npgsql.PostgresException pgEx) when (pgEx.SqlState == "55000" && pgEx.MessageText?.Contains("already an identity column") == true)
                        {
                            logger.LogWarning("Identity column conflict detected. Attempting to recover...");
                            
                            // Try to ensure the database schema is consistent
                            try
                            {
                                await context.Database.EnsureCreatedAsync();
                                logger.LogInformation("Database schema ensured");
                            }
                            catch (Exception ensureEx)
                            {
                                logger.LogWarning(ensureEx, "EnsureCreated also failed, proceeding with existing schema");
                            }
                        }
                        catch (Exception migEx)
                        {
                            logger.LogError(migEx, "Migration failed, trying EnsureCreated as fallback");
                            
                            // Fallback to EnsureCreated for development
                            try
                            {
                                await context.Database.EnsureCreatedAsync();
                                logger.LogInformation("Database created with EnsureCreated fallback");
                            }
                            catch (Exception ensureEx)
                            {
                                logger.LogError(ensureEx, "Both migration and EnsureCreated failed");
                                throw;
                            }
                        }

                        // Ensure Users.Id auto-generates in PostgreSQL even if prior migrations were SQLite-based
                        await EnsureUsersIdAutoGenerationAsync(context, logger);

                        // Ensure DateTime columns are correctly typed in PostgreSQL (convert from TEXT to timestamptz when needed)
                        await EnsureDateTimeColumnsAreCorrectTypeAsync(context, logger);

                        // Ensure boolean columns (e.g., IsPublished) use proper PostgreSQL boolean type instead of integer/text
                        await EnsureBooleanColumnsAreCorrectTypeAsync(context, logger);
                    }
                    else
                    {
                        logger.LogError("Cannot connect to database");
                        throw new InvalidOperationException("Database connection failed");
                    }
                    
                    await SeedData(context, configuration, environment);
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred during database initialization");
                    
                    // In production, we want the app to continue running even if migration fails
                    // so users can still access the site (though admin features might not work)
                    if (services.GetRequiredService<IWebHostEnvironment>().IsProduction())
                    {
                        logger.LogWarning("Continuing application startup despite database issues (Production mode)");
                    }
                    else
                    {
                        throw; // In development, fail fast to make issues obvious
                    }
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
            // Skip creating admin (and any users) in Production. You will manage users manually.
            if (!environment.IsProduction())
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
                        Id = 1, // Explicitly set admin ID to 1
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
            }
            
            // Seed Categories
            if (!await context.Categories.AnyAsync())
            {
                context.Categories.AddRange(
                    new Category { Id = 1, Name = "Technology", Slug = "technology", PostCategories = new List<PostCategory>() },
                    new Category { Id = 2, Name = "Lifestyle", Slug = "lifestyle", PostCategories = new List<PostCategory>() }
                );
                await context.SaveChangesAsync();
            }

            // Seed Tags
            if (!await context.Tags.AnyAsync())
            {
                context.Tags.AddRange(
                    new Tag { Id = 1, Name = "ASP.NET", Slug = "asp-net", PostTags = new List<PostTag>() },
                    new Tag { Id = 2, Name = "Angular", Slug = "angular", PostTags = new List<PostTag>() }
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

        private static async Task EnsureUsersIdAutoGenerationAsync(AppDbContext context, ILogger logger)
        {
            try
            {
                if (context.Database.IsNpgsql())
                {
                    const string sql = @"DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = current_schema() AND table_name = 'Users'
  ) THEN
    -- If column is not identity, try to convert it
    IF NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class t ON a.attrelid = t.oid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = current_schema()
        AND t.relname = 'Users'
        AND a.attname = 'Id'
        AND a.attidentity IN ('a','d')
    ) THEN
      BEGIN
        -- Drop any default first to avoid conflicts
        ALTER TABLE ""Users"" ALTER COLUMN ""Id"" DROP DEFAULT;
        -- Try to add identity (PostgreSQL 10+)
        ALTER TABLE ""Users"" ALTER COLUMN ""Id"" ADD GENERATED BY DEFAULT AS IDENTITY;
      EXCEPTION
        WHEN duplicate_object THEN
          NULL;
        WHEN feature_not_supported THEN
          NULL;
        WHEN others THEN
          -- Ignore and fall back to sequence default enforcement
          NULL;
      END;
    END IF;

    -- Ensure there is a proper sequence-based default if identity is not in effect
    IF NOT EXISTS (
      SELECT 1
      FROM pg_attribute a
      JOIN pg_class t ON a.attrelid = t.oid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = current_schema()
        AND t.relname = 'Users'
        AND a.attname = 'Id'
        AND a.attidentity IN ('a','d')
    ) THEN
      -- Create a sequence if it does not exist
      IF NOT EXISTS (
        SELECT 1 FROM pg_class s
        JOIN pg_namespace n ON n.oid = s.relnamespace
        WHERE s.relkind = 'S'
          AND n.nspname = current_schema()
          AND s.relname = 'Users_Id_seq'
      ) THEN
        EXECUTE 'CREATE SEQUENCE ""Users_Id_seq""';
      END IF;
      -- Attach the sequence as default and ownership
      IF NOT EXISTS (
        SELECT 1
        FROM pg_attrdef d
        JOIN pg_attribute a ON a.attrelid = d.adrelid AND a.attnum = d.adnum
        JOIN pg_class t ON t.oid = d.adrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = current_schema()
          AND t.relname = 'Users'
          AND a.attname = 'Id'
          AND pg_get_expr(d.adbin, d.adrelid) LIKE 'nextval%'
      ) THEN
        EXECUTE 'ALTER TABLE ""Users"" ALTER COLUMN ""Id"" SET DEFAULT nextval(''""Users_Id_seq""''::regclass)';
        EXECUTE 'ALTER SEQUENCE ""Users_Id_seq"" OWNED BY ""Users"".""Id""';
      END IF;

      -- Align sequence value with current MAX(Id) to avoid collisions
      PERFORM setval('""Users_Id_seq""', COALESCE((SELECT MAX(""Id"") FROM ""Users""), 0));
    END IF;
  END IF;
END $$;";

                     await context.Database.ExecuteSqlRawAsync(sql);
                     logger.LogInformation("Ensured Users.Id is auto-generated (identity/default) and sequence aligned");
                 }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to enforce Users.Id auto-generation. Continuing.");
            }
        }

        private static async Task EnsureDateTimeColumnsAreCorrectTypeAsync(AppDbContext context, ILogger logger)
        {
            try
            {
                if (context.Database.IsNpgsql())
                {
                    const string fixDateColumnsSql = @"DO $$
BEGIN
  -- Users.CreatedAt
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Users'
      AND column_name = 'CreatedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Users"" ALTER COLUMN ""CreatedAt"" TYPE timestamp with time zone USING (""CreatedAt""::timestamptz)';
  END IF;

  -- Posts date columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Posts'
      AND column_name = 'CreatedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""CreatedAt"" TYPE timestamp with time zone USING (""CreatedAt""::timestamptz)';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Posts'
      AND column_name = 'PublishedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""PublishedAt"" TYPE timestamp with time zone USING (""PublishedAt""::timestamptz)';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Posts'
      AND column_name = 'UpdatedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""UpdatedAt"" TYPE timestamp with time zone USING (""UpdatedAt""::timestamptz)';
  END IF;

  -- Pages date columns
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Pages'
      AND column_name = 'CreatedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""CreatedAt"" TYPE timestamp with time zone USING (""CreatedAt""::timestamptz)';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Pages'
      AND column_name = 'UpdatedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""UpdatedAt"" TYPE timestamp with time zone USING (""UpdatedAt""::timestamptz)';
  END IF;

  -- Media.UploadedAt
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Media'
      AND column_name = 'UploadedAt'
      AND data_type = 'text'
  ) THEN
    EXECUTE 'ALTER TABLE ""Media"" ALTER COLUMN ""UploadedAt"" TYPE timestamp with time zone USING (""UploadedAt""::timestamptz)';
  END IF;
END $$;";

                    await context.Database.ExecuteSqlRawAsync(fixDateColumnsSql);
                    logger.LogInformation("Ensured DateTime columns use PostgreSQL timestamp with time zone instead of text");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to coerce DateTime columns to proper PostgreSQL types. Continuing.");
            }
        }
        
        private static async Task EnsureBooleanColumnsAreCorrectTypeAsync(AppDbContext context, ILogger logger)
        {
            try
            {
                if (context.Database.IsNpgsql())
                {
                    const string fixBooleanColumnsSql = @"DO $$
BEGIN
  -- Posts.IsPublished
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Posts'
      AND column_name = 'IsPublished'
      AND data_type IN ('integer','text','smallint')
  ) THEN
    -- Normalize nulls to 0 to avoid cast errors
    EXECUTE 'UPDATE ""Posts"" SET ""IsPublished"" = COALESCE(""IsPublished"", 0)';
    BEGIN
      EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""IsPublished"" DROP DEFAULT';
    EXCEPTION WHEN others THEN
      NULL;
    END;
    -- Use appropriate conversion depending on underlying type
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Posts'
        AND column_name = 'IsPublished'
        AND data_type IN ('integer','smallint')
    ) THEN
      EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""IsPublished"" TYPE boolean USING (""IsPublished"" <> 0)';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Posts'
        AND column_name = 'IsPublished'
        AND data_type = 'text'
    ) THEN
      EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""IsPublished"" TYPE boolean USING ((NULLIF(TRIM(""IsPublished""), '''')::integer) <> 0)';
    END IF;
    EXECUTE 'ALTER TABLE ""Posts"" ALTER COLUMN ""IsPublished"" SET DEFAULT false';
  END IF;

  -- Pages.IsPublished
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Pages'
      AND column_name = 'IsPublished'
      AND data_type IN ('integer','text','smallint')
  ) THEN
    EXECUTE 'UPDATE ""Pages"" SET ""IsPublished"" = COALESCE(""IsPublished"", 0)';
    BEGIN
      EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""IsPublished"" DROP DEFAULT';
    EXCEPTION WHEN others THEN
      NULL;
    END;
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Pages'
        AND column_name = 'IsPublished'
        AND data_type IN ('integer','smallint')
    ) THEN
      EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""IsPublished"" TYPE boolean USING (""IsPublished"" <> 0)';
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'Pages'
        AND column_name = 'IsPublished'
        AND data_type = 'text'
    ) THEN
      EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""IsPublished"" TYPE boolean USING ((NULLIF(TRIM(""IsPublished""), '''')::integer) <> 0)';
    END IF;
    EXECUTE 'ALTER TABLE ""Pages"" ALTER COLUMN ""IsPublished"" SET DEFAULT false';
  END IF;
END $$;";

                    await context.Database.ExecuteSqlRawAsync(fixBooleanColumnsSql);
                    logger.LogInformation("Ensured IsPublished columns use PostgreSQL boolean type");
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to coerce boolean columns to PostgreSQL boolean. Continuing.");
            }
        }
        
    }
}