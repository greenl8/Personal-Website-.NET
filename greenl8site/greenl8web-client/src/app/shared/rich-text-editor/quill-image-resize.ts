import Quill from 'quill';

// Placeholder for window type
declare const window: any;

export class ImageResize {
  quill: any;
  options: any;
  currentImage: any;
  overlay: HTMLElement;
  handles: HTMLElement[];
  
  constructor(quill: any, options: any = {}) {
    this.quill = quill;
    this.options = options;
    this.currentImage = null;
    this.handles = [];
    
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.classList.add('image-resizer');
    this.overlay.style.display = 'none';
    
    // Create resize handles
    this.addResizeHandles();
    
    // Append to editor
    this.quill.root.parentNode.appendChild(this.overlay);
    
    // Listen for selection change and check if image
    this.quill.on('selection-change', this.checkSelection.bind(this));
    
    // Listen for image click
    this.quill.root.addEventListener('click', this.checkImage.bind(this));
    
    // Hide overlay on scroll
    this.quill.root.addEventListener('scroll', () => {
      this.hideOverlay();
    });
    
    // Hide overlay on editor blur
    this.quill.root.addEventListener('blur', () => {
      this.hideOverlay();
    });
  }
  
  addResizeHandles(): void {
    const positions = ['se', 'ne', 'sw', 'nw'];
    
    positions.forEach(position => {
      const handle = document.createElement('div');
      handle.classList.add('resize-handle', `resize-handle-${position}`);
      handle.addEventListener('mousedown', this.handleMousedown.bind(this, position));
      this.overlay.appendChild(handle);
      this.handles.push(handle);
    });
  }
  
  checkSelection(range: any): void {
    if (!range) return;
    
    const [blot, offset] = this.quill.getLeaf(range.index);
    
    if (blot && blot.domNode && blot.domNode.tagName === 'IMG') {
      this.showOverlay(blot.domNode);
    } else {
      this.hideOverlay();
    }
  }
  
  checkImage(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    
    if (element && element.tagName === 'IMG') {
      this.showOverlay(element);
    } else if (element && !this.overlay.contains(element)) {
      this.hideOverlay();
    }
  }
  
  showOverlay(image: HTMLElement): void {
    this.currentImage = image;
    
    // Position overlay over image
    const rect = image.getBoundingClientRect();
    const containerRect = this.quill.root.parentNode.getBoundingClientRect();
    
    this.overlay.style.left = `${rect.left - containerRect.left}px`;
    this.overlay.style.top = `${rect.top - containerRect.top}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
    this.overlay.style.display = 'block';
  }
  
  hideOverlay(): void {
    this.overlay.style.display = 'none';
    this.currentImage = null;
  }
  
  handleMousedown(position: string, event: MouseEvent): void {
    if (!this.currentImage) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = this.currentImage.width;
    const startHeight = this.currentImage.height;
    
    const aspectRatio = startWidth / startHeight;
    const isAspectRatioLocked = true; // Could be an option
    
    // Add event listeners for resize
    const moveHandler = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();
      
      let deltaX = moveEvent.clientX - startX;
      let deltaY = moveEvent.clientY - startY;
      
      // Adjust deltas based on position
      if (position.includes('n')) deltaY = -deltaY;
      if (position.includes('w')) deltaX = -deltaX;
      
      // Maintain aspect ratio if locked
      if (isAspectRatioLocked) {
        if (Math.abs(deltaX) > Math.abs(deltaY * aspectRatio)) {
          deltaY = deltaX / aspectRatio;
        } else {
          deltaX = deltaY * aspectRatio;
        }
      }
      
      let newWidth = startWidth + deltaX;
      let newHeight = startHeight + deltaY;
      
      // Ensure minimum dimensions
      newWidth = Math.max(30, newWidth);
      newHeight = Math.max(30, newHeight);
      
      // Update image and overlay dimensions
      this.currentImage.width = newWidth;
      this.currentImage.height = newHeight;
      
      // Update overlay position
      this.showOverlay(this.currentImage);
    };
    
    const upHandler = () => {
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
    };
    
    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
  }
}

// Register as Quill module
if (window && window.Quill) {
  window.Quill.register('modules/imageResize', ImageResize);
}

export default ImageResize;