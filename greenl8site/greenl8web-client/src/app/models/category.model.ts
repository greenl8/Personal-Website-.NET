export interface Category {
    id: number;
    name: string;
    slug: string;
  }
  
  export interface CategoryCreateEdit {
    name: string;
    slug?: string;
  }