import type { VideoRenditionList } from './video-rendition-list';

export const renditionToLists = new Map();

export class VideoRendition {
  id?: string;
  width?: number;
  height?: number;
  bitrate?: number;
  frameRate?: number;
  codec?: string;
  #selected = false;

  get selected(): boolean {
    return this.#selected;
  }

  set selected(val: boolean) {
    if (this.#selected === val) return;
    this.#selected = val;

    if (val !== true) return;

    const videoRenditionLists = renditionToLists.get(this) ?? [];
    videoRenditionLists.forEach((videoRenditionList: VideoRenditionList) => {
      // If other renditions are unselected, then a change event will be fired.
      let hasUnselected = false;
      [...videoRenditionList].forEach((rendition) => {
        if (rendition === this) return;
        rendition.selected = false;
        hasUnselected = true;
      });
      if (hasUnselected) {
        videoRenditionList.dispatchEvent(
          new CustomEvent('change', { detail: this })
        );
      }
    });
  }
}
