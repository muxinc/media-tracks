import { enabledChanged } from './audio-rendition-list.js';

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

    enabledChanged(this);
  }
}
