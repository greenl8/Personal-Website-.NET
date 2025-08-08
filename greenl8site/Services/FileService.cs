using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace YourProjectName.Services
{
    public class FileService
    {
        private readonly string _uploadDirectory;
        private readonly string _baseUrl;
        
        public FileService(IConfiguration config)
        {
                _uploadDirectory = config["FileStorage:UploadDirectory"] ?? throw new ArgumentNullException("FileStorage:UploadDirectory configuration is missing");
                _baseUrl = config["FileStorage:BaseUrl"] ?? throw new ArgumentNullException("FileStorage:BaseUrl configuration is missing");
            
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }
        
        public async Task<(string filePath, string fileName, long fileSize, string fileType)> SaveFileAsync(IFormFile file)
        {
            // Create a unique filename to prevent overwriting
            string fileExtension = Path.GetExtension(file.FileName);
            string fileName = $"{Guid.NewGuid()}{fileExtension}";
            
            // Determine file type (mime type)
            string fileType = file.ContentType;
            
            // Create year/month folders for better organization
            string dateFolder = DateTime.UtcNow.ToString("yyyy/MM");
            string relativePath = Path.Combine(dateFolder, fileName);
            string fullPath = Path.Combine(_uploadDirectory, relativePath);
            
            // Ensure directory exists
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
            
            // Save the file
            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            
            return (relativePath, file.FileName, file.Length, fileType);
        }
        
        public string GetFileUrl(string filePath)
        {
            // If it's already a full URL, return as-is
            if (filePath.StartsWith("http://") || filePath.StartsWith("https://"))
            {
                return filePath;
            }
            
            // Normalize path separators
            var normalizedPath = filePath.Replace("\\", "/");
            
            // If the path already starts with "uploads/", don't add it again
            if (normalizedPath.StartsWith("uploads/"))
            {
                return $"{_baseUrl}/{normalizedPath}";
            }
            
            // Otherwise, add the uploads prefix
            return $"{_baseUrl}/uploads/{normalizedPath}";
        }
        
        public bool DeleteFile(string filePath)
        {
            string fullPath = Path.Combine(_uploadDirectory, filePath);
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                return true;
            }
            
            return false;
        }
    }
}