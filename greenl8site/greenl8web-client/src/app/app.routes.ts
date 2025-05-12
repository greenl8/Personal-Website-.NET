import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard } from './guards/auth.guard';
import { CategoryListComponent } from './admin/category-list/category-list.component';
import { MediaLibraryComponent } from './admin/media/media-library/media-library.component';
import { PostListComponent } from './admin/posts/post-list/post-list.component';
import { PostEditComponent } from './admin/posts/post-edit/post-edit.component';
import { PageListComponent } from './admin/pages/page-list/page-list.component';
import { PageEditComponent } from './admin/pages/page-edit/page-edit.component';
import { PostDetailComponent } from './public/post-detail/post-detail.component';
import { PageDetailComponent } from './public/page-detail/page-detail.component';
import { TagListComponent } from './admin/tags/tags-list/tag-list.component';
import { ErrorPageComponent } from './shared/error-page/error-page.component';

export const routes: Routes = [
    { 
        path: '', 
        component: HomeComponent,
        data: { preload: true } // Preload home component
    },
    { path: 'login', component: LoginComponent },
    { 
        path: 'blog', 
        component: HomeComponent,
        data: { preload: true } // Preload blog view
    },
    { 
        path: 'post/:slug', 
        component: PostDetailComponent,
        data: { preload: true } // Preload post detail
    },
    { 
        path: 'page/:slug', 
        component: PageDetailComponent,
        data: { preload: true } // Preload page detail
    },
    { 
        path: 'admin',
        canActivate: [AuthGuard, AdminGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { 
                path: 'dashboard', 
                component: AdminDashboardComponent,
                canActivate: [AuthGuard, AdminGuard],
                data: { preload: true } // Preload admin dashboard
            },
            {
                path: 'posts',
                children: [
                    { path: '', component: PostListComponent },
                    { path: 'new', component: PostEditComponent },
                    { path: 'edit/:id', component: PostEditComponent }
                ]
            },
            {
                path: 'pages',
                children: [
                    { path: '', component: PageListComponent },
                    { path: 'new', component: PageEditComponent },
                    { path: 'edit/:id', component: PageEditComponent }
                ]
            },
            { path: 'categories', component: CategoryListComponent },
            { path: 'tags', component: TagListComponent },
            { path: 'media', component: MediaLibraryComponent }
        ]
    },
    // Error routes
    { 
        path: 'forbidden', 
        component: ErrorPageComponent, 
        data: { errorType: '403', preload: true } 
    },
    { 
        path: 'server-error', 
        component: ErrorPageComponent, 
        data: { errorType: '500', preload: true } 
    },
    { 
        path: '404', 
        component: ErrorPageComponent,
        data: { preload: true }
    },
    { path: '**', redirectTo: '404' },
    {
        path: 'error/403',
        component: ErrorPageComponent,
        data: { errorType: '403' }
    },
    {
        path: 'error/404',
        component: ErrorPageComponent,
        data: { errorType: '404' }
    },
    {
        path: 'error/500',
        component: ErrorPageComponent,
        data: { errorType: '500' }
    },
    {
        path: '**',
        redirectTo: 'error/404'
    }
];