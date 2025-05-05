export interface Media {
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
    uploadedBy: string;
    url: string;
  }
  
  export interface MediaFilter {
    page: number;
    pageSize: number;
    searchTerm?: string;
    fileType?: string;
  }