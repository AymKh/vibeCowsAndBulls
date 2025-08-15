import { Injectable } from '@angular/core';
import { Howl, Howler } from 'howler';



@Injectable({
  providedIn: 'root'
})
export class AudioService {

  private soundLibrary: Record<string, string> = {
    'mainMenuHover': '/assets/audio/menu.mp3'
  }

  public selectSoundFromLibrary(soundName: string): any {
    const sound: Howl = new Howl({
      src: this.soundLibrary[soundName],
      html5: true
    })
    return sound;
  }

  public playAudio(soundInstance: Howl): void {
    soundInstance.play();
  }

  public pauseAudio(soundInstance: Howl): void {
    soundInstance.pause();
  }

}
