import type { AudioTrackList } from './audio-track-list';
import { AudioRendition } from './audio-rendition';
import { AudioRenditionList } from './audio-rendition-list';

export const audioTrackToLists = new Map();

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
  label: string = '';
  language: string = '';
  sourceBuffer?: SourceBuffer;
  #enabled = false;
  #renditions = new AudioRenditionList();

  addRendition(src: string, bitrate?: number, codec?: string) {
    const rendition = new AudioRendition();
    rendition.src = src;
    rendition.bitrate = bitrate;
    rendition.codec = codec;
    this.#renditions.addRendition(rendition);
    return rendition;
  }

  get renditions() {
    return this.#renditions;
  }

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(val: boolean) {
    if (this.#enabled === val) return;
    this.#enabled = val;

    // Whenever an audio track in an AudioTrackList that was disabled is enabled,
    // and whenever one that was enabled is disabled, the user agent must queue a
    // media element task given the media element to fire an event named `change`
    // at the AudioTrackList object.
    const audioTrackLists = audioTrackToLists.get(this) ?? [];
    audioTrackLists.forEach((audioTrackList: AudioTrackList) => {
      audioTrackList.dispatchEvent(new Event('change'));
    });
  }
}
