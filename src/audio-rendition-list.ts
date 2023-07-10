import { AudioRendition, audioRenditionToList } from './audio-rendition.js';
import { RenditionEvent } from './rendition-event.js';

export class AudioRenditionList extends EventTarget {
  [index: number]: AudioRendition;
  #renditions: Set<AudioRendition> = new Set();
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#renditions.values();
  }

  get length() {
    return this.#renditions.size;
  }

  add(rendition: AudioRendition) {
    if (!audioRenditionToList.has(rendition)) {
      audioRenditionToList.set(rendition, this);
    }

    this.#renditions.add(rendition);
    const index = this.length - 1;

    if (!(index in AudioRenditionList.prototype)) {
      Object.defineProperty(AudioRenditionList.prototype, index, {
        get() {
          return [...this.#renditions][index];
        },
      });
    }

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
    });
  }

  remove(rendition: AudioRendition) {
    audioRenditionToList.delete(rendition);

    this.#renditions.delete(rendition);

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
    });
  }

  contains(rendition: AudioRendition) {
    return this.#renditions.has(rendition);
  }

  getRenditionById(id: string): AudioRendition | null {
    return [...this.#renditions].find((rendition) => `${rendition.id}` === `${id}`) ?? null;
  }

  get onaddrendition() {
    return this.#addRenditionCallback;
  }

  set onaddrendition(callback: ((event?: { track: AudioRendition }) => void) | undefined) {
    if (this.#addRenditionCallback) {
      this.removeEventListener('addrendition', this.#addRenditionCallback);
      this.#addRenditionCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#addRenditionCallback = callback;
      // @ts-ignore
      this.addEventListener('addrendition', callback);
    }
  }

  get onremoverendition() {
    return this.#removeRenditionCallback;
  }

  set onremoverendition(callback: ((event?: { track: AudioRendition }) => void) | undefined) {
    if (this.#removeRenditionCallback) {
      this.removeEventListener(
        'removerendition',
        this.#removeRenditionCallback
      );
      this.#removeRenditionCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#removeRenditionCallback = callback;
      // @ts-ignore
      this.addEventListener('removerendition', callback);
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
