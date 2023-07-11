import type { VideoRendition } from './video-rendition.js';
import { RenditionEvent } from './rendition-event.js';
import { getPrivate } from './utils.js';

const changeRequested = new Map();

export function selectedChanged(rendition: VideoRendition) {
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

export function addRendition(renditionList: VideoRenditionList, rendition: VideoRendition) {
  if (!getPrivate(rendition).list) {
    getPrivate(rendition).list = renditionList;
  }

  const { renditionSet } = getPrivate(renditionList);
  renditionSet.add(rendition);
  const index = renditionSet.size - 1;

  if (!(index in VideoRenditionList.prototype)) {
    Object.defineProperty(VideoRenditionList.prototype, index, {
      get() {
        return getCurrentRenditions(this)[index];
      },
    });
  }

  queueMicrotask(() => {
    if (!getPrivate(rendition).track.selected) return;
    renditionList.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
  });
}

export function removeRendition(rendition: VideoRendition) {
  const renditionList: VideoRenditionList = getPrivate(rendition).list;
  delete getPrivate(rendition).list;

  const { renditionSet } = getPrivate(renditionList);
  renditionSet.delete(rendition);

  queueMicrotask(() => {
    if (!getPrivate(rendition).track.selected) return;
    renditionList.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
  });
}

function getCurrentRenditions(renditionList: VideoRenditionList) {
  return [...getPrivate(renditionList).renditionSet].filter(rendition => {
    return getPrivate(rendition).track.selected;
  });
}

export class VideoRenditionList extends EventTarget {
  [index: number]: VideoRendition;
  #addRenditionCallback?: () => void;
  #removeRenditionCallback?: () => void;
  #changeCallback?: () => void;

  constructor() {
    super();
    getPrivate(this).renditionSet = new Set();
  }

  [Symbol.iterator]() {
    return getCurrentRenditions(this).values();
  }

  get length() {
    return getCurrentRenditions(this).length;
  }

  getRenditionById(id: string): VideoRendition | null {
    return getCurrentRenditions(this).find((rendition) => `${rendition.id}` === `${id}`) ?? null;
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
