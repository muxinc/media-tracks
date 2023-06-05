import type { AudioRenditionList } from './audio-rendition-list';

export const renditionToLists = new Map();

export class AudioRendition {
  src?: string;
  id?: string;
  bitrate?: number;
  codec?: string;
  #selected = false;

  get selected(): boolean {
    return this.#selected;
  }

  set selected(val: boolean) {
    if (this.#selected === val) return;
    this.#selected = val;

    if (val !== true) return;

    const audioRenditionLists = renditionToLists.get(this) ?? [];
    audioRenditionLists.forEach((audioRenditionList: AudioRenditionList) => {
      // If other renditions are unselected, then a change event will be fired.
      let hasUnselected = false;
      [...audioRenditionList].forEach((rendition) => {
        if (rendition === this) return;
        rendition.selected = false;
        hasUnselected = true;
      });
      if (hasUnselected) {
        audioRenditionList.dispatchEvent(
          new CustomEvent('change', { detail: this })
        );
      }
    });
  }
}
