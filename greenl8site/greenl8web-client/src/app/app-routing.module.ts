import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Core components
import { LoginComponent } from './login/login.component';

// Public components
import { HomeComponent } from './public/home/home.component';
import { PostDetailComponent } from './public/post-detail/post-detail.component';
import { PageDetailComponent } from './public/page-detail/page-detail.component'; 

// Admin components
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PostListComponent } from './admin/posts/post-list/post-list.component';
import { PostEditComponent } from './admin/posts/post-edit/post-edit.component';
import { PageListComponent } from './admin/pages/page-list/page-list.component';
import { PageEditComponent } from './admin/pages/page-edit/page-edit.component';
import { MediaLibraryComponent } from './admin/media/media-library/media-library.component';
import { CategoryListComponent } from './admin/category-list/category-list.component';
import { TagListComponent } from './admin/tags/tags-list/tag-list.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // Public routes
  { path: '', component: HomeComponent },
  { path: 'post/:slug', component: PostDetailComponent },
  { path: 'login', component: LoginComponent },
  
  // Admin routes (protected)
  { 
    path: 'admin', 
    component: AdminDashboardComponent, 
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'posts', pathMatch: 'full' },
      { path: 'posts', component: PostListComponent },
      { path: 'posts/new', component: PostEditComponent },
      { path: 'posts/edit/:id', component: PostEditComponent },
      { path: 'pages', component: PageListComponent },
      { path: 'pages/new', component: PageEditComponent },
      { path: 'pages/edit/:id', component: PageEditComponent },
      { path: 'media', component: MediaLibraryComponent },
      { path: 'categories', component: CategoryListComponent },
      { path: 'tags', component: TagListComponent }
    ]
  },
  
  // Wildcard route (must be last) - Maps to page by slug or 404
  { path: ':slug', component: PageDetailComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }