import { VideoTrack, videoTrackToList } from './video-track.js';
import { TrackEvent } from './track-event.js';

// https://html.spec.whatwg.org/multipage/media.html#videotracklist
export class VideoTrackList extends EventTarget {
  [index: number]: VideoTrack;
  #tracks: Set<VideoTrack> = new Set();
  #addTrackCallback?: () => void;
  #removeTrackCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#tracks.values();
  }

  get length() {
    return this.#tracks.size;
  }

  add(track: VideoTrack) {
    if (!videoTrackToList.has(track)) {
      videoTrackToList.set(track, this);
    }

    this.#tracks.add(track);
    const index = this.length - 1;

    if (!(index in VideoTrackList.prototype)) {
      Object.defineProperty(VideoTrackList.prototype, index, {
        get() {
          return [...this.#tracks][index];
        }
      });
    }

    // The event is queued, this is in line with the native `addtrack` event.
    // https://html.spec.whatwg.org/multipage/media.html#dom-media-addtexttrack
    //
    // This can be useful for setting additional props on the track object
    // after having called addTrack().
    queueMicrotask(() => {
      this.dispatchEvent(new TrackEvent('addtrack', { track }));
    });
  }

  remove(track: VideoTrack) {
    videoTrackToList.delete(track);

    this.#tracks.delete(track);

    queueMicrotask(() => {
      this.dispatchEvent(new TrackEvent('removetrack', { track }));
    });
  }

  contains(track: VideoTrack) {
    return this.#tracks.has(track);
  }

  getTrackById(id: string): VideoTrack | null {
    return [...this.#tracks].find((track) => track.id === id) ?? null;
  }

  get selectedIndex() {
    return [...this.#tracks].findIndex((track) => track.selected);
  }

  get onaddtrack() {
    return this.#addTrackCallback;
  }

  set onaddtrack(callback: ((event?: { track: VideoTrack }) => void) | undefined) {
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

  set onremovetrack(callback: ((event?: { track: VideoTrack }) => void) | undefined) {
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
