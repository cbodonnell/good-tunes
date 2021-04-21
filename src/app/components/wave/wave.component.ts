import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-wave',
  templateUrl: './wave.component.html',
  styleUrls: ['./wave.component.scss']
})
export class WaveComponent implements AfterViewInit {

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('source') source: ElementRef;

  constructor() { }

  ngAfterViewInit(): void {
    let canvas = this.canvas.nativeElement;
    let ctx = canvas.getContext("2d");
    let audioCtx = new AudioContext();
    let analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    let source = audioCtx.createMediaElementSource(this.source.nativeElement);
    source.connect(analyser);
    source.connect(audioCtx.destination);
    let data = new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame(loopingFunction);

    function loopingFunction() {
      requestAnimationFrame(loopingFunction);
      analyser.getByteFrequencyData(data);
      draw(data);
    }

    function draw(data) {
      data = [...data];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let space = canvas.width / data.length;
      data.forEach((value, i) => {
        ctx.beginPath();
        ctx.moveTo(space * i, canvas.height);
        ctx.lineTo(space * i, canvas.height - value);
        ctx.stroke();
      })
    }
  }

}
