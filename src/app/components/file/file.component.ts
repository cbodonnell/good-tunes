import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Song } from 'src/app/interfaces/Song';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {

  @Output() onFileLoad = new EventEmitter<Song>();

  // TODO: Add support for an activity stream
  // Ex: @bixlinux@funkwhale.it
  // Ex: https://funkwhale.it/.well-known/webfinger?resource=acct:bixlinux@funkwhale.it
  // Ex: https://funkwhale.it/federation/actors/bixlinux (-H 'Accept: application/activity+json')
  // Ex: https://funkwhale.it/federation/actors/bixlinux/outbox (-H 'Accept: application/activity+json')
  // Ex: https://funkwhale.it/federation/actors/bixlinux/outbox?page=1 (-H 'Accept: application/activity+json')

  constructor() { }

  ngOnInit(): void {
  }

  uploadFile(event) {
    const reader = (file) => {
      return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.readAsDataURL(file);
      });
    }
    reader(event[0]).then((result: string) => {
      this.onFileLoad.emit({
        title: event[0].name,
        file: result
      });
    });
  }

  onFileChange(event) {
    this.uploadFile(event.target.files); 
  }

  onFileClick(event) {
    event.stopPropagation();
  }

}
