import { AudioTrack, audioTrackToLists } from './audio-track';

export class AudioTrackList extends EventTarget {
  #tracks: AudioTrack[] = [];
  #addTrackCallback?: () => void;
  #removeTrackCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#tracks.values();
  }

  get length() {
    return this.#tracks.length;
  }

  addTrack(track: AudioTrack) {
    // can tracks belong to more track lists? todo add logic for that
    audioTrackToLists.set(track, new Set([this]));

    const length = this.#tracks.push(track);
    const index = length - 1;

    Object.defineProperty(AudioTrackList.prototype, index, {
      get() {
        return this.#tracks[index];
      }
    });

    this.dispatchEvent(new CustomEvent('addtrack', { detail: track }));
  }

  removeTrack(track: AudioTrack) {
    audioTrackToLists.delete(track);

    this.#tracks.splice(this.#tracks.indexOf(track), 1);
    this.dispatchEvent(new CustomEvent('removetrack', { detail: track }));
  }

  getTrackById(id: string): AudioTrack | null {
    return this.#tracks.find((track) => track.id === id) ?? null;
  }

  get selectedIndex() {
    return this.#tracks.findIndex((track) => track.selected);
  }

  get onaddtrack() {
    return this.#addTrackCallback;
  }

  set onaddtrack(callback) {
    if (this.#addTrackCallback) {
      this.removeEventListener('addtrack', this.#addTrackCallback);
      this.#addTrackCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#addTrackCallback = callback;
      this.addEventListener('addtrack', callback);
    }
  }

  get onremovetrack() {
    return this.#removeTrackCallback;
  }

  set onremovetrack(callback) {
    if (this.#removeTrackCallback) {
      this.removeEventListener('removetrack', this.#removeTrackCallback);
      this.#removeTrackCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#removeTrackCallback = callback;
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
