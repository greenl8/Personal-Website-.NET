using AutoMapper;
using YourProjectName.DTOs;
using YourProjectName.Models;

namespace YourProjectName
{
    public class MappingProfiles : Profile
    {
        public MappingProfiles()
        {
            // User mappings
            CreateMap<User, UserDto>();
            
            // Post mappings
            CreateMap<Post, PostDto>()
                .ForMember(dest => dest.Categories, opt => opt.MapFrom(src => 
                    src.PostCategories.Select(pc => pc.Category)))
                .ForMember(dest => dest.Tags, opt => opt.MapFrom(src => 
                    src.PostTags.Select(pt => pt.Tag)));
                    
            CreateMap<Post, PostListDto>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author.Username));
                
            // Page mappings
            CreateMap<Page, PageDto>();
            CreateMap<Page, PageListDto>()
                .ForMember(dest => dest.AuthorName, opt => opt.MapFrom(src => src.Author.Username));
                
            // Category mappings
            CreateMap<Category, CategoryDto>();
            
            // Tag mappings
            CreateMap<Tag, TagDto>();
            
            // Media mappings
            CreateMap<Media, MediaDto>()
                .ForMember(dest => dest.UploadedBy, opt => opt.MapFrom(src => src.UploadedBy != null ? src.UploadedBy.Username : null));
        }
    }
}