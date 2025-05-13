import { Component, forwardRef, Input, ViewEncapsulation, OnDestroy, AfterViewInit, ElementRef, ViewChild, Inject, PLATFORM_ID, NgZone, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { isPlatformBrowser, CommonModule } from '@angular/common';
// Quill and its styles are dynamically imported
import 'quill/dist/quill.snow.css'; 
import { MediaService } from '../../services/media.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MediaSelectorDialogComponent } from '../media-selector/media-selector-dialog.component';

// Configure Quill modules and formats
const MODULES = (Quill: any) => ({
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
  imageResize: {
    // See https://github.com/kensnyder/quill-image-resize-module for options
  }
});

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
  ],
  templateUrl: './rich-text-editor.component.html',
  styleUrls: ['./rich-text-editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ]
})
export class RichTextEditorComponent implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorElement: ElementRef;
  @Input() placeholder = 'Enter content here...';
  @Input() readOnly = false;
  @Input() minHeight = '200px';
  
  quillEditor: any = null;
  private Quill: any = null; // Store dynamically imported Quill
  content: string = '';
  disabled: boolean = false;
  isBrowser: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  
  // ControlValueAccessor callbacks
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
  
  constructor(
    private mediaService: MediaService,
    private dialog: MatDialog,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      console.warn('RichTextEditor: Not running in browser environment');
    }
  }
  
  async ngAfterViewInit(): Promise<void> {
    if (!this.isBrowser) {
      this.setError('Not running in browser environment');
      return;
    }

    if (!this.editorElement || !this.editorElement.nativeElement) {
      this.setError('Editor element not available');
      return;
    }

    this.ngZone.runOutsideAngular(async () => {
      try {
        // Dynamically import Quill
        const QuillImport = await import('quill');
        this.Quill = QuillImport.default; 

        // Dynamically import and register ImageResize module
        const ImageResizeImport = await import('./quill-image-resize');
        this.Quill.register('modules/imageResize', ImageResizeImport.ImageResize);

        setTimeout(() => {
          this.initQuillEditor();
          if (this.quillEditor) {
            this.registerImageHandler();
          }
        }, 0); // setTimeout with 0 can help ensure DOM is ready
      } catch (error) {
        console.error('Error loading Quill or ImageResize module:', error);
        this.setError('Error loading editor modules: ' + (error instanceof Error ? error.message : String(error)));
      }
    });
  }
  
  ngOnDestroy(): void {
    if (this.isBrowser && this.quillEditor) {
      try {
        this.quillEditor = null;
      } catch (error) {
        console.error('Error during destroy:', error);
      }
    }
  }
  
  setError(message: string): void {
    this.ngZone.run(() => {
      this.hasError = true;
      this.errorMessage = message;
      console.error('RichTextEditor error:', message);
    });
  }
  
  initQuillEditor(): void {
    if (!this.isBrowser || !this.editorElement || !this.editorElement.nativeElement || !this.Quill) {
      return;
    }
    
    try {
      this.quillEditor = new this.Quill(this.editorElement.nativeElement, {
        modules: MODULES(this.Quill), // Pass Quill to modules config
        placeholder: this.placeholder,
        readOnly: this.readOnly,
        theme: 'snow',
        bounds: this.editorElement.nativeElement
      });
      
      if (this.content) {
        this.quillEditor.clipboard.dangerouslyPasteHTML(this.content);
      }
      
      this.quillEditor.on('text-change', () => {
        if (!this.editorElement || !this.editorElement.nativeElement) return;
        
        const editor = this.editorElement.nativeElement.querySelector('.ql-editor');
        if (editor) {
          this.ngZone.run(() => {
            this.onChange(editor.innerHTML);
          });
        }
      });
      
      this.quillEditor.on('selection-change', (range: any) => {
        if (range) {
          // Editor gained focus
        } else {
          this.ngZone.run(() => {
            this.onTouched();
          });
        }
      });
      
      if (this.editorElement && this.editorElement.nativeElement) {
        const editor = this.editorElement.nativeElement.querySelector('.ql-editor');
        if (editor) {
          editor.style.minHeight = this.minHeight;
        }
      }
    } catch (error) {
      console.error('Error in Quill initialization:', error);
      this.setError('Failed to initialize editor: ' + (error instanceof Error ? error.message : String(error)));
    }
  }
  
  registerImageHandler(): void {
    if (!this.isBrowser || !this.quillEditor) return;
    
    try {
      const toolbar = this.quillEditor.getModule('toolbar');
      if (!toolbar) return;
      
      toolbar.addHandler('image', () => {
        this.ngZone.run(() => {
          this.openMediaSelector();
        });
      });
    } catch (error) {
      console.error('Error in registering image handler:', error);
    }
  }
  
  openMediaSelector(): void {
    if (!this.isBrowser) return;
    
    const dialogRef = this.dialog.open(MediaSelectorDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (!result || !this.quillEditor) return;
      
      try {
        const range = this.quillEditor.getSelection(true);
        if (range) {
          this.quillEditor.insertEmbed(range.index, 'image', result.url);
          this.quillEditor.setSelection(range.index + 1);
        }
      } catch (error) {
        console.error('Error inserting image:', error);
      }
    });
  }
  
  writeValue(value: string): void {
    this.content = value || '';
    
    if (this.isBrowser && this.quillEditor) {
      try {
        if (value) {
          this.quillEditor.clipboard.dangerouslyPasteHTML(value);
        } else {
          this.quillEditor.setText('');
        }
      } catch (error) {
        console.error('Error writing value to editor:', error);
      }
    }
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    
    if (this.isBrowser && this.quillEditor) {
      try {
        this.quillEditor.enable(!isDisabled);
      } catch (error) {
        console.error('Error setting disabled state:', error);
      }
    }
  }
}