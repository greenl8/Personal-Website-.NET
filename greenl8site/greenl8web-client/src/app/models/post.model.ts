import { Category } from './category.model';
import { Tag } from './tag.model';
import { User } from './user.model';

export interface Post {
  excerpt: string;
  id: number;
  title: string;
  content: string;
  slug: string;
  featuredImage: string;
  isPublished: boolean;
  createdAt: Date;
  publishedAt?: Date;
  updatedAt?: Date;
  author: User;
  categories: Category[];
  tags: Tag[];
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  featuredImage: string;
  isPublished: boolean;
  createdAt: Date;
  publishedAt?: Date;
  authorName: string;
}

export interface PostCreateEdit {
  title: string;
  content: string;
  slug?: string;
  featuredImage?: string;
  isPublished: boolean;
  categoryIds: number[];
  tagIds: number[];
}

export interface PostFilter {
  page: number;
  pageSize: number;
  isPublished?: boolean;
  categoryId?: number;
  tagId?: number;
  searchTerm?: string;
}