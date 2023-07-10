import { enabledChanged } from './video-rendition-list.js';

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

    enabledChanged(this);
  }
}
