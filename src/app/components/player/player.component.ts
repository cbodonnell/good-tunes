import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Howl, Howler } from 'howler';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit {

  private elms = [
    'track',
    'timer',
    'duration',
    'playBtn',
    'pauseBtn',
    'prevBtn',
    'nextBtn',
    'playlistBtn',
    'volumeBtn',
    'progress',
    'bar',
    'waveform',
    'loading',
    'playlist',
    'list',
    'volume',
    'barEmpty',
    'barFull',
    'sliderBtn'
  ];

  private elements: any = {};

  private index = 0;
  private playlist = [
    {
      title: 'Strobe',
      file: 'assets/mp3/Strobe.mp3',
      howl: null
    },
    {
      title: 'Levels',
      file: 'assets/mp3/Levels.mp3',
      howl: null
    },
    {
      title: 'One More Cupcake',
      file: 'assets/mp3/One_More_Cupcake.mp3',
      howl: null
    },
    {
      title: 'Movements',
      file: 'assets/mp3/Movements.mp3',
      howl: null
    },
    {
      title: 'I Cry',
      file: 'assets/mp3/I_Cry.mp3',
      howl: null
    },
    {
      title: 'Lights Dubstep',
      file: 'assets/mp3/Lights_Dubstep.mp3',
      howl: null
    },
    {
      title: 'Julia',
      file: 'assets/mp3/Julia.wav',
      howl: null
    },
  ];

  private player: any;

  private sliderDown = false;

  @ViewChild('canvas') canvas: ElementRef;
  @ViewChild('waveform') waveform: ElementRef;

  private isVisualizerSetup = false;

  constructor() { }

  ngOnInit(): void {
    this.mapElements();
    this.setupPlayer();
  }

  private mapElements() {
    this.elms.forEach((elm) => {
      this.elements[elm] = document.getElementById(elm);
    });
  }

  private setupPlayer() {
    // Display the title of the first track.
    this.elements.track.innerHtml = '1. ' + this.playlist[0].title;
    
    // Setup the playlist display.
    this.playlist.forEach((song) => {
      var div = document.createElement('div');
      div.className = 'list-song';
      div.innerHTML = song.title;
      div.onclick = () => {
        this.player.skipTo(this.playlist.indexOf(song));
      };
      this.elements.list.appendChild(div);
    });
  }

  // TODO: Find the best place to put this so it only is called once
  private setupVisualizer() {
    let canvas = this.canvas.nativeElement;
    let ctx = canvas.getContext("2d");
    const minFreq = 20; // Hz
    const maxFreq = 20000; // Hz

    var analyser = Howler.ctx.createAnalyser();
    Howler.masterGain.connect(analyser);
    analyser.fftSize = 2048;
    let data = new Uint8Array(analyser.frequencyBinCount);
    requestAnimationFrame(loopingFunction);
    this.isVisualizerSetup = true;

    function loopingFunction() {
      requestAnimationFrame(loopingFunction);
      analyser.getByteFrequencyData(data);
      draw(data.slice(0, data.length - (24000 - maxFreq) / 24000 * data.length));
    }

    // // Linear
    // function draw(data) {
    //   data = [...data];
    //   ctx.clearRect(0, 0, canvas.width, canvas.height);
    //   let space = canvas.width / data.length;
    //   data.forEach((value, i) => {
    //     let amp = value / 256 * canvas.height;
    //     ctx.beginPath();
    //     ctx.moveTo(space * i, canvas.height);
    //     ctx.lineTo(space * i, canvas.height - value);
    //     ctx.strokeStyle = 'rgb(' + (amp + 100) + ',50,50)'
    //     ctx.stroke();
    //   })
    // }

    // Polar
    function draw(data) {
      data = [...data];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let bufferWidth = maxFreq / data.length; // Logarithmic
      let radius = Math.min(canvas.width, canvas.height) / 2;
      // let theta = 2 * Math.PI / data.length; // Linear
      data.forEach((value, i) => {
        let freq = bufferWidth * (i + 1); // Logarithmic
        let normal = value / 256;
        let amp = normal * radius;
        // let delta = theta * i; // Linear
        let delta = 2 * Math.PI * (Math.log(freq) - Math.log(minFreq)) / (Math.log(maxFreq) - Math.log(minFreq)); // Logarithmic
        let x0 = radius * Math.cos(delta) + (canvas.width / 2);
        let y0 = (canvas.height / 2) - radius * Math.sin(delta);
        let x1 = (radius - amp) * Math.cos(delta) + (canvas.width / 2);
        let y1 = (canvas.height / 2) - (radius - amp) * Math.sin(delta);
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        let a = [113,243,187]; // triade of background gradient A color
        let b = [61,77,145]; // triade of background gradient B color
        // let a = [169,243,113];
        // let b = [145,129,61];
        ctx.strokeStyle = 'rgb(' + ((Math.max(a[0], b[0]) - Math.min(a[0], b[0])) * normal + Math.min(a[0], b[0])) + ',' + 
        ((Math.max(a[1], b[1]) - Math.min(a[1], b[1])) * normal + Math.min(a[1], b[1])) + ',' + 
        ((Math.max(a[2], b[2]) - Math.min(a[2], b[2])) * normal + Math.min(a[2], b[2])) + ')';
        // ctx.strokeStyle = 'rgb(' + (amp + 100) + ',50,50)';
        ctx.lineWidth = (2 * Math.PI - delta) * 2;
        ctx.stroke();
      })
    }
  }

  onPlay() {
    this.play(this.index);
  }

  onPause() {
    this.pause();
  }

  onPrev() {
    this.skip('prev');
  }

  onNext() {
    this.skip('next');
  }

  onSeek(event: any) {
    this.seek(event.clientX / window.innerWidth);
  }

  onPlaylist() {
    this.togglePlaylist();
  }

  onVolume() {
    this.toggleVolume();
  }

  onSlider(event: any) {
    var per = event.layerX / parseFloat(this.elements.barEmpty.scrollWidth);
    this.volume(per);
  }

  onSliderDown() {
    this.sliderDown = true;
  }

  onSliderUp() {
    this.sliderDown = false;
  }

  onSliderMove(event: any) {
    this.move(event);
  }

  /**
   * Play a song in the playlist.
   * @param  {number} index Index of the song in the playlist (leave empty to play the first or current).
   */
  private play(index: number) {
    var sound: any;

    index = typeof index === 'number' ? index : this.index;
    var data = this.playlist[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (data.howl) {
      sound = data.howl;
    } else {
      sound = data.howl = new Howl({
        src: [data.file],
        // html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
        onplay: () => {
          // Display the duration.
          this.elements.duration.innerHTML = this.formatTime(Math.round(sound.duration()));
          // Start upating the progress of the track.
          requestAnimationFrame(this.step.bind(this));
          // Start the wave animation if we have already loaded
          this.elements.waveform.style.display = 'block';
          this.elements.bar.style.display = 'none';
          this.elements.pauseBtn.style.display = 'block';
        },
        onload: () => {
          // Start the wave animation.
          this.elements.waveform.style.display = 'block';
          this.elements.bar.style.display = 'none';
          this.elements.loading.style.display = 'none';
        },
        onend: () => {
          // Stop the wave animation.
          this.elements.waveform.style.display = 'none';
          this.elements.bar.style.display = 'block';
          this.skip('next');
        },
        onpause: () => {
          // Stop the wave animation.
          this.elements.waveform.style.display = 'none';
          this.elements.bar.style.display = 'block';
        },
        onstop: () => {
          // Stop the wave animation.
          this.elements.waveform.style.display = 'none';
          this.elements.bar.style.display = 'block';
        },
        onseek: () => {
          // Start upating the progress of the track.
          requestAnimationFrame(this.step.bind(this));
        }
      });
    }

    // Begin playing the sound.
    sound.play();

    // Update the track display.
    this.elements.track.innerHTML = (index + 1) + '. ' + data.title;

    // Show the pause button.
    if (sound.state() === 'loaded') {
      this.elements.playBtn.style.display = 'none';
      this.elements.pauseBtn.style.display = 'block';
    } else {
      this.elements.loading.style.display = 'block';
      this.elements.playBtn.style.display = 'none';
      this.elements.pauseBtn.style.display = 'none';
    }

    // Keep track of the index we are currently playing.
    this.index = index;
    
    if (!this.isVisualizerSetup)
      this.setupVisualizer();
  }

  /**
   * Pause the currently playing track.
   */
  private pause() {
    // Get the Howl we want to manipulate.
    var sound = this.playlist[this.index].howl;

    // Puase the sound.
    sound.pause();

    // Show the play button.
    this.elements.playBtn.style.display = 'block';
    this.elements.pauseBtn.style.display = 'none';
  }

  /**
   * Skip to the next or previous track.
   * @param  {string} direction 'next' or 'prev'.
   */
  private skip(direction: 'next' | 'prev') {
    // Get the next track based on the direction of the track.
    var index = 0;
    if (direction === 'prev') {
      index = this.index - 1;
      if (index < 0) {
        index = this.playlist.length - 1;
      }
    } else {
      index = this.index + 1;
      if (index >= this.playlist.length) {
        index = 0;
      }
    }

    this.skipTo(index);
  }

  /**
   * Skip to a specific track based on its playlist index.
   * @param  {number} index Index in the playlist.
   */
  private skipTo(index: number) {
    // Stop the current track.
    if (this.playlist[this.index].howl) {
      this.playlist[this.index].howl.stop();
    }

    // Reset progress.
    this.elements.progress.style.width = '0%';

    // Play the new track.
    this.play(index);
  }

  /**
   * Set the volume and update the volume slider display.
   * @param  {number} val Volume between 0 and 1.
   */
  private volume(val: number) {
    // Update the global volume (affecting all Howls).
    Howler.volume(val);

    // Update the display on the slider.
    var barWidth = (val * 90) / 100;
    this.elements.barFull.style.width = (barWidth * 100) + '%';
    this.elements.sliderBtn.style.left = (window.innerWidth * barWidth + window.innerWidth * 0.05 - 25) + 'px';
  }

  /**
   * Seek to a new position in the currently playing track.
   * @param  {number} per Percentage through the song to skip.
   */
  private seek(per: number) {
    // Get the Howl we want to manipulate.
    var sound = this.playlist[this.index].howl;

    // Convert the percent into a seek position.
    if (sound.playing()) {
      sound.seek(sound.duration() * per);
    }
  }

  /**
   * The step called within requestAnimationFrame to update the playback position.
   */
  private step() {
    // Get the Howl we want to manipulate.
    var sound = this.playlist[this.index].howl;

    // Determine our current seek position.
    var seek = (sound.seek() || 0) as number;
    this.elements.timer.innerHTML = this.formatTime(Math.round(seek));
    this.elements.progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

    // If the sound is still playing, continue stepping.
    if (sound.playing()) {
      requestAnimationFrame(this.step.bind(this));
    }
  }

  /**
   * Toggle the playlist display on/off.
   */
   private togglePlaylist() {
    var display = (this.elements.playlist.style.display === 'block') ? 'none' : 'block';

    setTimeout(() => {
      this.elements.playlist.style.display = display;
    }, (display === 'block') ? 0 : 500);
    this.elements.playlist.className = (display === 'block') ? 'fadein' : 'fadeout';
  }

  /**
   * Toggle the volume display on/off.
   */
   private toggleVolume() {
    var self = this;
    var display = (this.elements.volume.style.display === 'block') ? 'none' : 'block';

    setTimeout(() => {
      this.elements.volume.style.display = display;
    }, (display === 'block') ? 0 : 500);
    this.elements.volume.className = (display === 'block') ? 'fadein' : 'fadeout';
  }

  /**
   * Format the time from seconds to M:SS.
   * @param  {number} secs Seconds to format.
   * @return {string}      Formatted time.
   */
   private formatTime(secs: number): string {
    var minutes = Math.floor(secs / 60) || 0;
    var seconds = (secs - minutes * 60) || 0;

    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  private move(event: any) {
    if (this.sliderDown) {
      var x = event.clientX || event.touches[0].clientX;
      var startX = window.innerWidth * 0.05;
      var layerX = x - startX;
      var per = Math.min(1, Math.max(0, layerX / parseFloat(this.elements.barEmpty.scrollWidth)));
      this.volume(per);
    }
  };
}
