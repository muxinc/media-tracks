import type { AudioRenditionList } from './audio-rendition-list.js';

export const audioRenditionToList = new Map();
const changeRequested = new Map();

/**
 * - There can only be 1 rendition active in a rendition list.
 * - The consumer should use the `enabled` setter to select 1 or multiple
 *   renditions that the engine is allowed to play.
 * - The `active` setter should be used by the media engine implementation.
 */
export class AudioRendition {
  src?: string;
  id?: string;
  bitrate?: number;
  codec?: string;
  #enabled = false;
  #active = false;

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(val: boolean) {
    if (this.#enabled === val) return;
    this.#enabled = val;

    const renditionList: AudioRenditionList = audioRenditionToList.get(this);

    // Prevent firing a rendition list `change` event multiple times per tick.
    if (changeRequested.get(renditionList)) return;
    changeRequested.set(renditionList, true);

    queueMicrotask(() => {
      changeRequested.delete(renditionList);
      renditionList.dispatchEvent(new Event('change'));
    });
  }

  get active(): boolean {
    return this.#active;
  }

  set active(val: boolean) {
    if (this.#active === val) return;
    this.#active = val;

    if (val !== true) return;

    const renditionList: AudioRenditionList = audioRenditionToList.get(this);
    // If other renditions are inactivated, then a renditionchange event will be fired.
    let hasInactivated = false;
    for (const rendition of renditionList) {
      if (rendition === this) continue;
      rendition.active = false;
      hasInactivated = true;
    }
    if (hasInactivated) {
      queueMicrotask(() => {
        renditionList.dispatchEvent(new Event('renditionchange'));
      });
    }
  }
}
