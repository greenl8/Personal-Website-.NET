using Microsoft.EntityFrameworkCore;
using YourProjectName.Models;

namespace YourProjectName.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Page> Pages { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Media> Media { get; set; }
        public DbSet<PostCategory> PostCategories { get; set; }
        public DbSet<PostTag> PostTags { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure many-to-many relationship between Post and Category
            modelBuilder.Entity<PostCategory>()
                .HasKey(pc => new { pc.PostId, pc.CategoryId });
                
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Post)
                .WithMany(p => p.PostCategories)
                .HasForeignKey(pc => pc.PostId);
                
            modelBuilder.Entity<PostCategory>()
                .HasOne(pc => pc.Category)
                .WithMany(c => c.PostCategories)
                .HasForeignKey(pc => pc.CategoryId);
                
            // Configure many-to-many relationship between Post and Tag
            modelBuilder.Entity<PostTag>()
                .HasKey(pt => new { pt.PostId, pt.TagId });
                
            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Post)
                .WithMany(p => p.PostTags)
                .HasForeignKey(pt => pt.PostId);
                
            modelBuilder.Entity<PostTag>()
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.PostTags)
                .HasForeignKey(pt => pt.TagId);
                
            // Configure one-to-many relationships
            modelBuilder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Posts)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Page>()
                .HasOne(p => p.Author)
                .WithMany(u => u.Pages)
                .HasForeignKey(p => p.AuthorId)
                .OnDelete(DeleteBehavior.Restrict);
                
            modelBuilder.Entity<Media>()
                .HasOne(m => m.UploadedBy)
                .WithMany(u => u.UploadedMedia)
                .HasForeignKey(m => m.UploadedById)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}