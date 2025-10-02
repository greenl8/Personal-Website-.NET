using Microsoft.Extensions.Configuration;
using System;

namespace greenl8site.Services
{
    public class EnvironmentService
    {
        /// <summary>
        /// Resolves configuration values that may contain environment variable placeholders
        /// </summary>
        /// <param name="value">The configuration value that may contain ${ENV_VAR} placeholders</param>
        /// <returns>The resolved value with environment variables substituted</returns>
        public static string? ResolveEnvironmentVariables(string? value)
        {
            if (string.IsNullOrEmpty(value))
                return value;

            // Handle ${VAR_NAME} pattern
            if (value.StartsWith("${") && value.EndsWith("}"))
            {
                var envVarName = value.Substring(2, value.Length - 3);
                var envValue = Environment.GetEnvironmentVariable(envVarName);
                Console.WriteLine($"Environment variable {envVarName}: {(string.IsNullOrEmpty(envValue) ? "NOT SET" : "SET")}");
                return envValue;
            }

            return value;
        }

        /// <summary>
        /// Converts PostgreSQL URL format to .NET connection string format
        /// </summary>
        /// <param name="postgresUrl">PostgreSQL URL (postgres://user:pass@host:port/db)</param>
        /// <returns>.NET PostgreSQL connection string</returns>
        public static string? ConvertPostgresUrl(string? postgresUrl)
        {
            if (string.IsNullOrEmpty(postgresUrl))
            {
                Console.WriteLine("PostgreSQL URL is null or empty");
                return postgresUrl;
            }

            Console.WriteLine("Original PostgreSQL URL detected (redacted)");

            // Check if it's already a proper connection string (contains "Host=" or "Server=")
            if (postgresUrl.Contains("Host=") || postgresUrl.Contains("Server="))
            {
                Console.WriteLine("Connection string is already in .NET format");
                return postgresUrl;
            }

            // Parse postgres://user:password@host:port/database format
            if (postgresUrl.StartsWith("postgres://") || postgresUrl.StartsWith("postgresql://"))
            {
                try
                {
                    var uri = new Uri(postgresUrl);
                    var userInfo = uri.UserInfo.Split(':');
                    var username = userInfo.Length > 0 ? userInfo[0] : "";
                    var password = userInfo.Length > 1 ? userInfo[1] : "";
                    
                    // Extract database name - handle the case where LocalPath might be just "/" or empty
                    var database = uri.LocalPath.TrimStart('/');
                    if (string.IsNullOrEmpty(database))
                    {
                        // Default to postgres database if none specified
                        database = "postgres";
                        Console.WriteLine("No database specified in URL, defaulting to 'postgres'");
                    }
                    
                    // Use SSL by default for cloud PostgreSQL providers (Railway, Render, etc.)
                    string connectionString = $"Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true";
                    Console.WriteLine("Using cloud PostgreSQL connection with SSL");
                    
                    Console.WriteLine($"Converted connection string: Host={uri.Host};Port={uri.Port};Database={database};Username={username};Password=***");
                    return connectionString;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error parsing PostgreSQL URL: {ex.Message}");
                    return postgresUrl; // Return original if parsing fails
                }
            }

            Console.WriteLine("PostgreSQL URL format not recognized");
            return postgresUrl;
        }

        /// <summary>
        /// Gets configuration value with environment variable resolution
        /// </summary>
        /// <param name="configuration">Configuration instance</param>
        /// <param name="key">Configuration key</param>
        /// <returns>Resolved configuration value</returns>
        public static string? GetResolvedValue(IConfiguration configuration, string key)
        {
            var value = configuration[key];
            return ResolveEnvironmentVariables(value);
        }

        /// <summary>
        /// Gets connection string with environment variable resolution and PostgreSQL URL conversion
        /// </summary>
        /// <param name="configuration">Configuration instance</param>
        /// <param name="name">Connection string name</param>
        /// <returns>Resolved and converted connection string</returns>
        public static string? GetResolvedConnectionString(IConfiguration configuration, string name)
        {
            Console.WriteLine($"Getting connection string for: {name}");
            var connectionString = configuration.GetConnectionString(name);
            Console.WriteLine($"Raw connection string from config: {(string.IsNullOrEmpty(connectionString) ? "NULL/EMPTY" : "PRESENT (REDACTED)")}");
            
            var resolved = ResolveEnvironmentVariables(connectionString);
            Console.WriteLine($"After environment variable resolution: {(string.IsNullOrEmpty(resolved) ? "NULL/EMPTY" : "HAS VALUE")}");
            
            var converted = ConvertPostgresUrl(resolved);
            return converted;
        }
    }
} 