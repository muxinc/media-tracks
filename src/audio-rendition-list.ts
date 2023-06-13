import { AudioRendition, audioRenditionToList } from './audio-rendition.js';
import { RenditionEvent } from './rendition-event.js';

export class AudioRenditionList extends EventTarget {
  [index: number]: AudioRendition;
  #renditions: AudioRendition[] = [];
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#renditions.values();
  }

  get length() {
    return this.#renditions.length;
  }

  add(rendition: AudioRendition) {
    audioRenditionToList.set(rendition, this);

    const length = this.#renditions.push(rendition);
    const index = length - 1;

    if (!(index in AudioRenditionList.prototype)) {
      Object.defineProperty(AudioRenditionList.prototype, index, {
        get() {
          return this.#renditions[index];
        },
      });
    }

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
    });
  }

  remove(rendition: AudioRendition) {
    audioRenditionToList.delete(rendition);

    this.#renditions.splice(this.#renditions.indexOf(rendition), 1);
    this.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
  }

  getRenditionById(id: string): AudioRendition | null {
    return this.#renditions.find((rendition) => `${rendition.id}` === `${id}`) ?? null;
  }

  get activeIndex() {
    return this.#renditions.findIndex((rendition) => rendition.active);
  }

  get onaddrendition() {
    return this.#addRenditionCallback;
  }

  set onaddrendition(callback) {
    if (this.#addRenditionCallback) {
      this.removeEventListener('addrendition', this.#addRenditionCallback);
      this.#addRenditionCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#addRenditionCallback = callback;
      this.addEventListener('addrendition', callback);
    }
  }

  get onremoverendition() {
    return this.#removeRenditionCallback;
  }

  set onremoverendition(callback) {
    if (this.#removeRenditionCallback) {
      this.removeEventListener(
        'removerendition',
        this.#removeRenditionCallback
      );
      this.#removeRenditionCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#removeRenditionCallback = callback;
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
