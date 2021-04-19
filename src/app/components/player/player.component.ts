import { Component, OnInit } from '@angular/core';
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
    } as any,
  ];

  private player: any;

  private sliderDown = false;

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
        html5: true, // Force to HTML5 so that the audio can stream in (best for large files).
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
