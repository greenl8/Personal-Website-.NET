import { User } from './user.model';

export interface Page {
  id: number;
  title: string;
  content: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt?: Date;
  author: User;
}

export interface PageListItem {
  id: number;
  title: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  authorName: string;
}

export interface PageCreateEdit {
  title: string;
  content: string;
  slug?: string;
  isPublished: boolean;
}