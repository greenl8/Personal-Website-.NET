export interface PaginatedResult<T> {
    items: T[];
    totalCount: number;
    pageCount: number;
    currentPage: number;
    pageSize: number;
  }