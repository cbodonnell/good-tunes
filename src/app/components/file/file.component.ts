import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Song } from 'src/app/interfaces/Song';

@Component({
  selector: 'app-file',
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit {

  @Output() onFileLoad = new EventEmitter<Song>();

  constructor() { }

  ngOnInit(): void {
  }

  uploadFile(evt){
    // evt is an array of the file(s) dropped on our div. Here we're assuming only one file has been uploaded
    // console.log('evt', evt);
    const reader = (file) => {
      return new Promise((resolve, reject) => {
          const fileReader = new FileReader();
          fileReader.onload = () => resolve(fileReader.result);
          fileReader.readAsDataURL(file);
      });
    }
    reader(evt[0]).then((result: string) => {
      this.onFileLoad.emit({
        title: evt[0].name,
        file: result
      });
    });
    // let payload = new FormData();
    // payload.append('data', evt[0]);
    // // File can now be uploaded by doing an http post with the payload
    // console.log(payload);

    // var fr=new FileReader();
    // fr.onload=function(){
    //   console.log(fr.result);
    // }
      
    // fr.readAsText(evt[0]);
  }

}
