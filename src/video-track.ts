import type { VideoTrackList } from './video-track-list';

export const trackToLists = new Map();

export const VideoTrackKind = {
  alternative: 'alternative',
  captions: 'captions',
  main: 'main',
  sign: 'sign',
  subtitles: 'subtitles',
  commentary: 'commentary'
};

export class VideoTrack {
  id?: string;
  kind?: string;
  label: string = '';
  language: string = '';
  #selected = false;

  get selected(): boolean {
    return this.#selected;
  }

  set selected(val: boolean) {
    if (this.#selected === val) return;
    this.#selected = val;

    if (val !== true) return;

    const videoTrackLists = trackToLists.get(this) ?? [];
    videoTrackLists.forEach((videoTrackList: VideoTrackList) => {
      // If other tracks are unselected, then a change event will be fired.
      let hasUnselected = false;
      [...videoTrackList].forEach((track) => {
        if (track === this) return;
        track.selected = false;
        hasUnselected = true;
      });
      if (hasUnselected) {
        videoTrackList.dispatchEvent(new CustomEvent('change', { detail: this }));
      }
    });
  }
}
