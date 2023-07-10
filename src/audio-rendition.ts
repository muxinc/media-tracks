import type { AudioRenditionList } from './audio-rendition-list.js';

export const audioRenditionToList = new Map();
const changeRequested = new Map();

/**
 * - The consumer should use the `enabled` setter to select 1 or multiple
 *   renditions that the engine is allowed to play.
 */
export class AudioRendition {
  src?: string;
  id?: string;
  bitrate?: number;
  codec?: string;
  #enabled = false;

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(val: boolean) {
    if (this.#enabled === val) return;
    this.#enabled = val;

    const renditionList: AudioRenditionList = audioRenditionToList.get(this);

    // Prevent firing a rendition list `change` event multiple times per tick.
    if (!renditionList || changeRequested.get(renditionList)) return;
    changeRequested.set(renditionList, true);

    queueMicrotask(() => {
      changeRequested.delete(renditionList);
      renditionList.dispatchEvent(new Event('change'));
    });
  }
}
