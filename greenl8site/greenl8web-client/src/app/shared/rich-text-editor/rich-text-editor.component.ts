import { Component, forwardRef, Input, ViewEncapsulation, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { MediaService } from '../../services/media.service';
import { MatDialog } from '@angular/material/dialog';
import { MediaSelectorDialogComponent } from '../media-selector/media-selector-dialog.component';

// Configure Quill modules and formats
const MODULES = {
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
  ]
};

@Component({
  selector: 'app-rich-text-editor',
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
export class RichTextEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('editor') editorElement: ElementRef;
  @Input() placeholder = 'Enter content here...';
  @Input() readOnly = false;
  @Input() minHeight = '200px';
  
  quillEditor: any;
  content: string = '';
  disabled: boolean = false;
  
  // ControlValueAccessor callbacks
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
  
  constructor(
    private mediaService: MediaService,
    private dialog: MatDialog
  ) {}
  
  ngAfterViewInit(): void {
    this.initQuillEditor();
    this.registerImageHandler();
  }
  
  ngOnDestroy(): void {
    if (this.quillEditor) {
      this.quillEditor = null;
    }
  }
  
  initQuillEditor(): void {
    // Initialize Quill editor
    this.quillEditor = new Quill(this.editorElement.nativeElement, {
      modules: MODULES,
      placeholder: this.placeholder,
      readOnly: this.readOnly,
      theme: 'snow',
      bounds: this.editorElement.nativeElement
    });
    
    // Set initial content if any
    if (this.content) {
      this.quillEditor.clipboard.dangerouslyPasteHTML(this.content);
    }
    
    // Handle text change events
    this.quillEditor.on('text-change', () => {
      const html = this.editorElement.nativeElement.querySelector('.ql-editor').innerHTML;
      this.onChange(html);
    });
    
    // Handle focus/blur events
    this.quillEditor.on('selection-change', (range) => {
      if (range) {
        // Editor gained focus
      } else {
        // Editor lost focus (blurred)
        this.onTouched();
      }
    });
    
    // Set minimum height
    this.editorElement.nativeElement.querySelector('.ql-editor').style.minHeight = this.minHeight;
  }
  
  registerImageHandler(): void {
    // Get toolbar element
    const toolbar = this.quillEditor.getModule('toolbar');
    
    // Replace default image button click handler
    toolbar.addHandler('image', () => {
      this.openMediaSelector();
    });
  }
  
  openMediaSelector(): void {
    const dialogRef = this.dialog.open(MediaSelectorDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: false
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Insert image at current selection
        const range = this.quillEditor.getSelection(true);
        this.quillEditor.insertEmbed(range.index, 'image', result.url);
        // Move cursor after the image
        this.quillEditor.setSelection(range.index + 1);
      }
    });
  }
  
  // ControlValueAccessor interface methods
  writeValue(value: string): void {
    this.content = value || '';
    
    // If Quill editor is already initialized, set content
    if (this.quillEditor) {
      if (value) {
        this.quillEditor.clipboard.dangerouslyPasteHTML(value);
      } else {
        this.quillEditor.setText('');
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
    
    if (this.quillEditor) {
      this.quillEditor.enable(!isDisabled);
    }
  }
}