import { AudioRendition } from './audio-rendition.js';
import { enabledChanged } from './audio-track-list.js';
import { addRendition, removeRendition } from './audio-rendition-list.js';
import { getPrivate } from './utils.js';

export const AudioTrackKind = {
  alternative: 'alternative',
  descriptions: 'descriptions',
  main: 'main',
  'main-desc': 'main-desc',
  translation: 'translation',
  commentary: 'commentary',
};

export class AudioTrack {
  id?: string;
  kind?: string;
  label = '';
  language = '';
  sourceBuffer?: SourceBuffer;
  #enabled = false;

  addRendition(src: string, codec?: string, bitrate?: number) {
    const rendition = new AudioRendition();
    getPrivate(rendition).track = this;
    rendition.src = src;
    rendition.codec = codec;
    rendition.bitrate = bitrate;
    addRendition(getPrivate(this).media.audioRenditions, rendition);
    return rendition;
  }

  removeRendition(rendition: AudioRendition) {
    delete getPrivate(rendition).track;
    removeRendition(rendition);
  }

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(val: boolean) {
    if (this.#enabled === val) return;
    this.#enabled = val;

    enabledChanged(this);
  }
}
