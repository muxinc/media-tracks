import type { AudioTrack } from './audio-track.js';
import { TrackEvent } from './track-event.js';
import { getPrivate } from './utils.js';

const changeRequested = new Map();

export function enabledChanged(track: AudioTrack) {
  // Whenever an audio track in an AudioTrackList that was disabled is enabled,
  // and whenever one that was enabled is disabled, the user agent must queue a
  // media element task given the media element to fire an event named `change`
  // at the AudioTrackList object.
  const trackList = getPrivate(track).list;

  // Prevent firing a track list `change` event multiple times per tick.
  if (!trackList || changeRequested.get(trackList)) return;
  changeRequested.set(trackList, true);

  queueMicrotask(() => {
    changeRequested.delete(trackList);
    trackList.dispatchEvent(new Event('change'));
  });
}

export function addAudioTrack(trackList: AudioTrackList, track: AudioTrack) {
  if (!getPrivate(track).list) {
    getPrivate(track).list = trackList;
  }

  const { renditionSet } = getPrivate(trackList);
  renditionSet.add(track);
  const index = renditionSet.size - 1;

  if (!(index in AudioTrackList.prototype)) {
    Object.defineProperty(AudioTrackList.prototype, index, {
      get() {
        return [...renditionSet][index];
      }
    });
  }

  // The event is queued, this is in line with the native `addtrack` event.
  // https://html.spec.whatwg.org/multipage/media.html#dom-media-addtexttrack
  //
  // This can be useful for setting additional props on the track object
  // after having called addTrack().
  queueMicrotask(() => {
    trackList.dispatchEvent(new TrackEvent('addtrack', { track }));
  });
}

export function removeAudioTrack(track: AudioTrack) {
  const trackList: AudioTrackList = getPrivate(track).list;
  delete getPrivate(track).list;

  const renditionSet: Set<AudioTrack> = getPrivate(trackList).renditionSet;
  renditionSet.delete(track);

  queueMicrotask(() => {
    trackList.dispatchEvent(new TrackEvent('removetrack', { track }));
  });
}

// https://html.spec.whatwg.org/multipage/media.html#audiotracklist
export class AudioTrackList extends EventTarget {
  [index: number]: AudioTrack;
  #addTrackCallback?: () => void;
  #removeTrackCallback?: () => void;
  #changeCallback?: () => void;

  constructor() {
    super();
    getPrivate(this).renditionSet = new Set();
  }

  get #tracks() {
    return getPrivate(this).renditionSet;
  }

  [Symbol.iterator]() {
    return this.#tracks.values();
  }

  get length() {
    return this.#tracks.size;
  }

  getTrackById(id: string): AudioTrack | null {
    return [...this.#tracks].find((track) => track.id === id) ?? null;
  }

  get onaddtrack() {
    return this.#addTrackCallback;
  }

  set onaddtrack(callback: ((event?: { track: AudioTrack }) => void) | undefined) {
    if (this.#addTrackCallback) {
      this.removeEventListener('addtrack', this.#addTrackCallback);
      this.#addTrackCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#addTrackCallback = callback;
      // @ts-ignore
      this.addEventListener('addtrack', callback);
    }
  }

  get onremovetrack() {
    return this.#removeTrackCallback;
  }

  set onremovetrack(callback: ((event?: { track: AudioTrack }) => void) | undefined) {
    if (this.#removeTrackCallback) {
      this.removeEventListener('removetrack', this.#removeTrackCallback);
      this.#removeTrackCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#removeTrackCallback = callback;
      // @ts-ignore
      this.addEventListener('removetrack', callback);
    }
  }

  get onchange() {
    return this.#changeCallback;
  }

  set onchange(callback) {
    if (this.#changeCallback) {
      this.removeEventListener('change', this.#changeCallback);
      this.#changeCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#changeCallback = callback;
      this.addEventListener('change', callback);
    }
  }
}
