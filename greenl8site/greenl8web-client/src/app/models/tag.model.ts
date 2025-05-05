export interface Tag {
    id: number;
    name: string;
    slug: string;
  }
  
  export interface TagCreateEdit {
    name: string;
    slug?: string;
  }