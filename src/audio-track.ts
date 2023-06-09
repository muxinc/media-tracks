import { AudioRendition } from './audio-rendition.js';
import { AudioRenditionList } from './audio-rendition-list.js';

export const audioTrackToList = new Map();
const changeRequested = new Map();

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
  #renditions = new AudioRenditionList();

  addRendition(src: string, codec?: string, bitrate?: number) {
    const rendition = new AudioRendition();
    rendition.src = src;
    rendition.codec = codec;
    rendition.bitrate = bitrate;
    this.#renditions.add(rendition);
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
    const trackList = audioTrackToList.get(this);

    // Prevent firing a track list `change` event multiple times per tick.
    if (changeRequested.get(trackList)) return;
    changeRequested.set(trackList, true);

    queueMicrotask(() => {
      changeRequested.delete(trackList);
      trackList.dispatchEvent(new Event('change'));
    });
  }
}
