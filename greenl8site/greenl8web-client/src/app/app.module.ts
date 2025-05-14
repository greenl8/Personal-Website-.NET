import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

// Core components
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { LoginComponent } from './login/login.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

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

// Shared components
import { RichTextEditorComponent } from './shared/rich-text-editor/rich-text-editor.component';
import { MediaSelectorComponent } from './shared/media-selector/media-selector-dialog.component';
import { PaginationComponent } from './shared/pagination/pagination.component';

// Material modules
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';


@NgModule({
  declarations: [
    

  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    CommonModule,
    NavBarComponent,
    AppComponent,
    LoginComponent,
    HomeComponent,
    PostDetailComponent,
    PageDetailComponent,
    AdminDashboardComponent,
    PostListComponent,
    PostEditComponent,
    // PageListComponent, // Removed as it is standalone
    PageEditComponent,
    MediaLibraryComponent,
    CategoryListComponent,
    TagListComponent,
    RichTextEditorComponent,
    MediaSelectorComponent,
    PaginationComponent,
    PageListComponent // Added as an import since it is standalone
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
})
export class AppModule { }