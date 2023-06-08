import type { VideoTrackList } from './video-track-list.js';
import { VideoRendition } from './video-rendition.js';
import { VideoRenditionList } from './video-rendition-list.js';

export const videoTrackToList = new Map();
const changeRequested = new Map();

export const VideoTrackKind = {
  alternative: 'alternative',
  captions: 'captions',
  main: 'main',
  sign: 'sign',
  subtitles: 'subtitles',
  commentary: 'commentary',
};

export class VideoTrack {
  id?: string;
  kind?: string;
  label: string = '';
  language: string = '';
  sourceBuffer?: SourceBuffer;
  #selected = false;
  #renditions = new VideoRenditionList();

  addRendition(
    src: string,
    width?: number,
    height?: number,
    codec?: string,
    bitrate?: number,
    frameRate?: number,
  ) {
    const rendition = new VideoRendition();
    rendition.src = src;
    rendition.width = width;
    rendition.height = height;
    rendition.frameRate = frameRate;
    rendition.bitrate = bitrate;
    rendition.codec = codec;
    this.#renditions.add(rendition);
    return rendition;
  }

  get renditions() {
    return this.#renditions;
  }

  get selected(): boolean {
    return this.#selected;
  }

  set selected(val: boolean) {
    if (this.#selected === val) return;
    this.#selected = val;

    if (val !== true) return;

    const trackList: VideoTrackList = videoTrackToList.get(this);
    // If other tracks are unselected, then a change event will be fired.
    let hasUnselected = false;
    for (let track of trackList) {
      if (track === this) continue;
      track.selected = false;
      hasUnselected = true;
    }
    if (hasUnselected) {

      // Prevent firing a track list `change` event multiple times per tick.
      if (changeRequested.get(trackList)) return;
      changeRequested.set(trackList, true);

      queueMicrotask(() => {
        changeRequested.delete(trackList);
        trackList.dispatchEvent(new Event('change'));
      });
    }
  }
}
