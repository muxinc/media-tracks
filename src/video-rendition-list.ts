import { VideoRendition, videoRenditionToList } from './video-rendition.js';
import { RenditionEvent } from './rendition-event.js';

export class VideoRenditionList extends EventTarget {
  [index: number]: VideoRendition;
  #renditions: Set<VideoRendition> = new Set();
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#renditions.values();
  }

  get length() {
    return this.#renditions.size;
  }

  add(rendition: VideoRendition) {
    if (!videoRenditionToList.has(rendition)) {
      videoRenditionToList.set(rendition, this);
    }

    this.#renditions.add(rendition);
    const index = this.length - 1;

    if (!(index in VideoRenditionList.prototype)) {
      Object.defineProperty(VideoRenditionList.prototype, index, {
        get() {
          return [...this.#renditions][index];
        },
      });
    }

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
    });
  }

  remove(rendition: VideoRendition) {
    videoRenditionToList.delete(rendition);

    this.#renditions.delete(rendition);

    queueMicrotask(() => {
      this.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
    });
  }

  contains(rendition: VideoRendition) {
    return this.#renditions.has(rendition);
  }

  getRenditionById(id: string): VideoRendition | null {
    return [...this.#renditions].find((rendition) => `${rendition.id}` === `${id}`) ?? null;
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
}
