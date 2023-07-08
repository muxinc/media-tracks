import { VideoRendition, videoRenditionToList } from './video-rendition.js';
import { RenditionEvent } from './rendition-event.js';

export class VideoRenditionList extends EventTarget {
  [index: number]: VideoRendition;
  #renditions: VideoRendition[] = [];
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;
  #renditionChangeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#renditions.values();
  }

  get length() {
    return this.#renditions.length;
  }

  add(rendition: VideoRendition) {
    videoRenditionToList.set(rendition, this);

    const length = this.#renditions.push(rendition);
    const index = length - 1;

    if (!(index in VideoRenditionList.prototype)) {
      Object.defineProperty(VideoRenditionList.prototype, index, {
        get() {
          return this.#renditions[index];
        },
      });
    }

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
    });
  }

  remove(rendition: VideoRendition) {
    videoRenditionToList.delete(rendition);

    this.#renditions.splice(this.#renditions.indexOf(rendition), 1);
    this.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
  }

  getRenditionById(id: string): VideoRendition | null {
    return this.#renditions.find((rendition) => `${rendition.id}` === `${id}`) ?? null;
  }

  get activeIndex() {
    return this.#renditions.findIndex((rendition) => rendition.active);
  }

  get onaddrendition() {
    return this.#addRenditionCallback;
  }

  set onaddrendition(callback: ((event?: { track: VideoRendition }) => void) | undefined) {
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

  set onremoverendition(callback: ((event?: { track: VideoRendition }) => void) | undefined) {
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

  get onrenditionchange() {
    return this.#changeCallback;
  }

  set onrenditionchange(callback) {
    if (this.#renditionChangeCallback) {
      this.removeEventListener('renditionchange', this.#renditionChangeCallback);
      this.#renditionChangeCallback = undefined;
    }
    if (typeof callback == 'function') {
      this.#renditionChangeCallback = callback;
      this.addEventListener('renditionchange', callback);
    }
  }
}
