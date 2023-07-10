import type { VideoRenditionList } from './video-rendition-list.js';

export const videoRenditionToList = new Map();
const changeRequested = new Map();

/**
 * - The consumer should use the `enabled` setter to select 1 or multiple
 *   renditions that the engine is allowed to play.
 */
export class VideoRendition {
  src?: string;
  id?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  frameRate?: number;
  codec?: string;
  #enabled = false;

  get enabled(): boolean {
    return this.#enabled;
  }

  set enabled(val: boolean) {
    if (this.#enabled === val) return;
    this.#enabled = val;

    const renditionList = videoRenditionToList.get(this);
    // Prevent firing a rendition list `change` event multiple times per tick.
    if (!renditionList || changeRequested.get(renditionList)) return;
    changeRequested.set(renditionList, true);

    queueMicrotask(() => {
      changeRequested.delete(renditionList);
      renditionList.dispatchEvent(new Event('change'));
    });
  }
}
