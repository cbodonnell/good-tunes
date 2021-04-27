import { Directive, Output, EventEmitter, HostBindingDecorator, HostListener, HostBinding } from '@angular/core';


@Directive({
  selector: '[appUpload]'
})
export class UploadDirective {

  @Output() onFileDropped = new EventEmitter<any>();
  @HostBinding('style.background-color') public background = 'transparent';
  @HostBinding('style.opacity') public opacity = '0';

  @HostListener('dragover', ['$event']) public onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#000';
    this.opacity = '0.33';
  }
  
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'transparent';
    this.opacity = '0';
  }

  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = 'transparent';
    this.opacity = '0';
    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.onFileDropped.emit(files);
    }
  }

  constructor() { }

}
