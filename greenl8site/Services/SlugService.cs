using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace YourProjectName.Services
{
    public class SlugService
    {
        public string GenerateSlug(string text)
        {
            // Remove diacritics (accents)
            var normalizedString = text.Normalize(NormalizationForm.FormD);
            var stringBuilder = new StringBuilder();
            
            foreach (var c in normalizedString)
            {
                var unicodeCategory = CharUnicodeInfo.GetUnicodeCategory(c);
                if (unicodeCategory != UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(c);
                }
            }
            
            // Convert to lowercase
            string slug = stringBuilder.ToString().Normalize(NormalizationForm.FormC).ToLower();
            
            // Remove special characters
            slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
            
            // Replace spaces with hyphens
            slug = Regex.Replace(slug, @"\s+", "-");
            
            // Remove multiple hyphens
            slug = Regex.Replace(slug, @"-+", "-");
            
            // Trim hyphens from beginning and end
            slug = slug.Trim('-');
            
            return slug;
        }
        
        public string EnsureUniqueSlug(string slug, Func<string, bool> exists)
        {
            string uniqueSlug = slug;
            int counter = 1;
            
            while (exists(uniqueSlug))
            {
                uniqueSlug = $"{slug}-{counter}";
                counter++;
            }
            
            return uniqueSlug;
        }
    }
}