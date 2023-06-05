import type { VideoTrackList } from './video-track-list';
import { VideoRendition } from './video-rendition';
import { VideoRenditionList } from './video-rendition-list';

export const videoTrackToLists = new Map();

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
    frameRate?: number,
    bitrate?: number,
    codec?: string
  ) {
    const rendition = new VideoRendition();
    rendition.src = src;
    rendition.width = width;
    rendition.height = height;
    rendition.frameRate = frameRate;
    rendition.bitrate = bitrate;
    rendition.codec = codec;
    this.#renditions.addRendition(rendition);
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

    const videoTrackLists = videoTrackToLists.get(this) ?? [];
    videoTrackLists.forEach((videoTrackList: VideoTrackList) => {
      // If other tracks are unselected, then a change event will be fired.
      let hasUnselected = false;
      [...videoTrackList].forEach((track) => {
        if (track === this) return;
        track.selected = false;
        hasUnselected = true;
      });
      if (hasUnselected) {
        videoTrackList.dispatchEvent(new Event('change'));
      }
    });
  }
}
