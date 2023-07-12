import type { VideoTrack } from './video-track.js';
import type { VideoRendition } from './video-rendition.js';
import { RenditionEvent } from './rendition-event.js';
import { getPrivate } from './utils.js';

export function addRendition(track: VideoTrack, rendition: VideoRendition) {
  const renditionList = getPrivate(track).media.videoRenditions;

  if (!getPrivate(rendition).list) {
    getPrivate(rendition).list = renditionList;
    getPrivate(rendition).track = track;
  }

  const { collection } = getPrivate(renditionList);
  collection.add(rendition);
  const index = collection.size - 1;

  if (!(index in VideoRenditionList.prototype)) {
    Object.defineProperty(VideoRenditionList.prototype, index, {
      get() { return getCurrentRenditions(this)[index]; },
    });
  }

  queueMicrotask(() => {
    if (!track.selected) return;

    renditionList.dispatchEvent(new RenditionEvent('addrendition', { rendition }));
  });
}

export function removeRendition(rendition: VideoRendition) {
  const renditionList: VideoRenditionList = getPrivate(rendition).list;
  const collection: Set<VideoRendition> = getPrivate(renditionList).collection;
  collection.delete(rendition);

  queueMicrotask(() => {
    const track: VideoTrack = getPrivate(rendition).track;
    if (!track.selected) return;

    renditionList.dispatchEvent(new RenditionEvent('removerendition', { rendition }));
  });
}

export function selectedChanged(rendition: VideoRendition) {
  const renditionList: VideoRenditionList = getPrivate(rendition).list;

  // Prevent firing a rendition list `change` event multiple times per tick.
  if (!renditionList || getPrivate(renditionList).changeRequested) return;
  getPrivate(renditionList).changeRequested = true;

  queueMicrotask(() => {
    delete getPrivate(renditionList).changeRequested;

    const track: VideoTrack = getPrivate(rendition).track;
    if (!track.selected) return;

    renditionList.dispatchEvent(new Event('change'));
  });
}

function getCurrentRenditions(renditionList: VideoRenditionList): VideoRendition[] {
  return [...getPrivate(renditionList).collection].filter(rendition => {
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
    getPrivate(this).collection = new Set();
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

  get selectedIndex() {
    return getCurrentRenditions(this).findIndex((rendition) => rendition.selected);
  }

  set selectedIndex(index) {
    for (const [i, rendition] of getCurrentRenditions(this).entries()) {
      rendition.selected = i === index;
    }
  }

  get onaddrendition() {
    return this.#addRenditionCallback;
  }

  set onaddrendition(callback: ((event?: { rendition: VideoRendition }) => void) | undefined) {
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

  set onremoverendition(callback: ((event?: { rendition: VideoRendition }) => void) | undefined) {
    if (this.#removeRenditionCallback) {
      this.removeEventListener('removerendition', this.#removeRenditionCallback);
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
