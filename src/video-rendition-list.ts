import { VideoRendition } from './video-rendition.js';
import { RenditionEvent } from './rendition-event.js';
import { getPrivate } from './utils.js';

const changeRequested = new Map();

export function enabledChanged(rendition: VideoRendition) {
  const renditionList: VideoRenditionList = getPrivate(rendition).list;
  // Prevent firing a rendition list `change` event multiple times per tick.
  if (!renditionList || changeRequested.get(renditionList)) return;
  changeRequested.set(renditionList, true);

  queueMicrotask(() => {
    changeRequested.delete(renditionList);

    if (!getPrivate(rendition).track.selected) return;
    renditionList.dispatchEvent(new Event('change'));
  });
}

export class VideoRenditionList extends EventTarget {
  [index: number]: VideoRendition;
  #renditions: Set<VideoRendition> = new Set();
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;

  [Symbol.iterator]() {
    return this.#currentRenditions.values();
  }

  get length() {
    return this.#currentRenditions.length;
  }

  get #currentRenditions() {
    return [...this.#renditions].filter(rendition => {
      return getPrivate(rendition).track.selected;
    });
  }

  add(rendition: VideoRendition) {
    if (!getPrivate(rendition).list) {
      getPrivate(rendition).list = this;
    }

    this.#renditions.add(rendition);
    const index = this.#renditions.size - 1;

    if (!(index in VideoRenditionList.prototype)) {
      Object.defineProperty(VideoRenditionList.prototype, index, {
        get() {
          return this.#currentRenditions[index];
        },
      });
    }

    queueMicrotask(() => {
      if (!getPrivate(rendition).track.selected) return;
      this.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
    });
  }

  remove(rendition: VideoRendition) {
    delete getPrivate(rendition).list;

    this.#renditions.delete(rendition);

    queueMicrotask(() => {
      if (!getPrivate(rendition).track.selected) return;
      this.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
    });
  }

  contains(rendition: VideoRendition) {
    return this.#currentRenditions.includes(rendition);
  }

  getRenditionById(id: string): VideoRendition | null {
    return this.#currentRenditions.find((rendition) => `${rendition.id}` === `${id}`) ?? null;
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
