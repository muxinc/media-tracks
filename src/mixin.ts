import { VideoTrack } from './video-track.js';
import { VideoTrackList, addVideoTrack, removeVideoTrack } from './video-track-list.js';
import { AudioTrack } from './audio-track.js';
import { AudioTrackList, addAudioTrack, removeAudioTrack } from './audio-track-list.js';
import { VideoRenditionList } from './video-rendition-list.js';
import { AudioRenditionList } from './audio-rendition-list.js';
import { getPrivate } from './utils.js';

import type { TrackEvent } from './track-event.js';

type VideoTrackType = typeof VideoTrack;
type AudioTrackType = typeof AudioTrack;

declare global {
  var VideoTrack: VideoTrackType; // eslint-disable-line
  var AudioTrack: AudioTrackType; // eslint-disable-line

  interface HTMLMediaElement {
    videoTracks: VideoTrackList;
    audioTracks: AudioTrackList;
    addVideoTrack(kind: string, label?: string, language?: string): VideoTrack;
    addAudioTrack(kind: string, label?: string, language?: string): AudioTrack;
    removeVideoTrack(track: VideoTrack): void;
    removeAudioTrack(track: AudioTrack): void;
    videoRenditions: VideoRenditionList;
    audioRenditions: AudioRenditionList;
  }
}

export function MediaTracksMixin<T>(MediaElementClass: T): T {
  // @ts-ignore
  if (!MediaElementClass?.prototype) return MediaElementClass;

  // Safari supports native media tracks by default.
  //
  // Chrome and Firefox can enable support with a browser flag
  // but it does not work because the browser doesn't know about
  // the manifest and the available tracks.
  // The browser only knows about the media source (MSE).
  //
  // We also want to add / remove tracks manually which is not
  // possible in the native implementations afaik.

  const getNativeVideoTracks = Object.getOwnPropertyDescriptor(
    // @ts-ignore
    MediaElementClass.prototype,
    'videoTracks'
  )?.get;

  const getNativeAudioTracks = Object.getOwnPropertyDescriptor(
    // @ts-ignore
    MediaElementClass.prototype,
    'audioTracks'
  )?.get;

  const isPolyfilled = getNativeVideoTracks &&
    !`${getNativeVideoTracks}`.includes('[native code]');

  if (isPolyfilled) return MediaElementClass;

  // Patch even if the tracks are natively supported because when both native
  // HLS and MSE is supported (e.g. Safari desktop) there is no way to know up
  // front what is used.
  //
  // `.videoTracks` and `.audioTracks` is a singular instance that could be
  // accessed right after media element creation to add an event listener for
  // example.
  //
  // Keep the native track list in sync with our shim track list below.

  // @ts-ignore
  Object.defineProperty(MediaElementClass.prototype, 'videoTracks', {
    get() { return initVideoTrackList(this); }
  });

  // @ts-ignore
  Object.defineProperty(MediaElementClass.prototype, 'audioTracks', {
    get() { return initAudioTrackList(this); }
  });

  // There is video.addTextTrack so makes sense to add addVideoTrack and addAudioTrack

  // @ts-ignore
  if (!('addVideoTrack' in MediaElementClass.prototype)) {
    // @ts-ignore
    MediaElementClass.prototype.addVideoTrack = function (kind: string, label = '', language = '') {
      const track = new VideoTrack();
      track.kind = kind;
      track.label = label;
      track.language = language;
      addVideoTrack(this, track);
      return track;
    }
  }

  // @ts-ignore
  if (!('removeVideoTrack' in MediaElementClass.prototype)) {
    // @ts-ignore
    MediaElementClass.prototype.removeVideoTrack = removeVideoTrack;
  }

  // @ts-ignore
  if (!('addAudioTrack' in MediaElementClass.prototype)) {
    // @ts-ignore
    MediaElementClass.prototype.addAudioTrack = function (kind: string, label = '', language = '') {
      const track = new AudioTrack();
      track.kind = kind;
      track.label = label;
      track.language = language;
      addAudioTrack(this, track);
      return track;
    }
  }

  // @ts-ignore
  if (!('removeAudioTrack' in MediaElementClass.prototype)) {
    // @ts-ignore
    MediaElementClass.prototype.removeAudioTrack = removeAudioTrack;
  }

  const initVideoTrackList = (media: HTMLMediaElement) => {
    let tracks: VideoTrackList = getPrivate(media).videoTracks;
    if (!tracks) {
      tracks = new VideoTrackList();
      getPrivate(media).videoTracks = tracks;

      // Sync native tracks to shim track list
      if (getNativeVideoTracks) {
        const nativeTracks = getNativeVideoTracks.call(media);

        for (const nativeTrack of nativeTracks) {
          addVideoTrack(media, nativeTrack);
        }

        nativeTracks.addEventListener('change', () => {
          tracks.dispatchEvent(new Event('change'));
        });

        nativeTracks.addEventListener('addtrack', (event: TrackEvent) => {
          // Note: adding native track instances to the shim track list here.
          // This works because the API is identical and change event is forwarded.
          // If tracks were manually added prevent native tracks from being added.
          if (![...tracks].some(t => t instanceof VideoTrack)) {
            addVideoTrack(media, event.track as VideoTrack);
          }
        });

        nativeTracks.addEventListener('removetrack', (event: TrackEvent) => {
          removeVideoTrack(event.track  as VideoTrack);
        });
      }
    }
    return tracks;
  }

  const initAudioTrackList = (media: HTMLMediaElement) => {
    let tracks: AudioTrackList = getPrivate(media).audioTracks;
    if (!tracks) {
      tracks = new AudioTrackList();
      getPrivate(media).audioTracks = tracks;

      // Sync native tracks to shim track list
      if (getNativeAudioTracks) {
        const nativeTracks = getNativeAudioTracks.call(media);

        for (const nativeTrack of nativeTracks) {
          addAudioTrack(media, nativeTrack);
        }

        nativeTracks.addEventListener('change', () => {
          tracks.dispatchEvent(new Event('change'));
        });

        nativeTracks.addEventListener('addtrack', (event: TrackEvent) => {
          // Note: adding native track instances to the shim track list here.
          // This works because the API is identical and change event is forwarded.
          // If tracks were manually added prevent native tracks from being added.
          if (![...tracks].some(t => t instanceof AudioTrack)) {
            addAudioTrack(media, event.track as AudioTrack);
          }
        });

        nativeTracks.addEventListener('removetrack', (event: TrackEvent) => {
          removeAudioTrack(event.track as AudioTrack);
        });
      }
    }
    return tracks;
  }

  // @ts-ignore
  if (!('videoRenditions' in MediaElementClass.prototype)) {
    // @ts-ignore
    Object.defineProperty(MediaElementClass.prototype, 'videoRenditions', {
      get() { return initVideoRenditions(this); }
    });
  }

  const initVideoRenditions = (media: HTMLMediaElement) => {
    let renditions = getPrivate(media).videoRenditions;
    if (!renditions) {
      renditions = new VideoRenditionList();
      getPrivate(renditions).media = media;
      getPrivate(media).videoRenditions = renditions;
    }
    return renditions;
  }

  // @ts-ignore
  if (!('audioRenditions' in MediaElementClass.prototype)) {
    // @ts-ignore
    Object.defineProperty(MediaElementClass.prototype, 'audioRenditions', {
      get() { return initAudioRenditions(this); }
    });
  }

  const initAudioRenditions = (media: HTMLMediaElement) => {
    let renditions = getPrivate(media).audioRenditions;
    if (!renditions) {
      renditions = new AudioRenditionList();
      getPrivate(renditions).media = media;
      getPrivate(media).audioRenditions = renditions;
    }
    return renditions;
  }

  return MediaElementClass;
}
