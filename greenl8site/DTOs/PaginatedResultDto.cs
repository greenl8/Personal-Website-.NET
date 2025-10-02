using System.Collections.Generic;

namespace greenl8site.DTOs
{
    public class PaginatedResultDto<T>
    {
        public required List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageCount { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
    }
}