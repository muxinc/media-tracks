import { VideoTrack } from './video-track.js';
import { VideoTrackList } from './video-track-list.js';
import { AudioTrack } from './audio-track.js';
import { AudioTrackList } from './audio-track-list.js';
import type { TrackEvent } from './track-event.js';
import { VideoRenditionList } from './video-rendition-list.js';
import { AudioRenditionList } from './audio-rendition-list.js';

type VideoTrackType = typeof VideoTrack;
type AudioTrackType = typeof AudioTrack;

declare global {
  var VideoTrack: VideoTrackType; // eslint-disable-line
  var AudioTrack: AudioTrackType; // eslint-disable-line

  interface HTMLMediaElement {
    videoTracks: VideoTrackList;
    audioTracks: AudioTrackList;
    addAudioTrack(kind: string, label?: string, language?: string): AudioTrack;
    addVideoTrack(kind: string, label?: string, language?: string): VideoTrack;
  }
}

interface MediaElementClass extends Partial<HTMLMediaElement> {
  new(): Partial<HTMLMediaElement>
}

export function assignMediaTracks(MediaElementClass: MediaElementClass) {

  if (!MediaElementClass?.prototype) return;

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
    MediaElementClass.prototype,
    'videoTracks'
  )?.get;

  const getNativeAudioTracks = Object.getOwnPropertyDescriptor(
    MediaElementClass.prototype,
    'audioTracks'
  )?.get;

  const isPolyfilled = getNativeVideoTracks &&
    !`${getNativeVideoTracks}`.includes('[native code]');

  if (isPolyfilled) return;

  // Patch even if the tracks are natively supported because when both native
  // HLS and MSE is supported (e.g. Safari desktop) there is no way to know up
  // front what is used.
  //
  // `.videoTracks` and `.audioTracks` is a singular instance that could be
  // accessed right after media element creation to add an event listener for
  // example.
  //
  // Keep the native track list in sync with our shim track list below.

  Object.defineProperty(MediaElementClass.prototype, 'videoTracks', {
    get() { return initVideoTrackList(this); }
  });

  Object.defineProperty(MediaElementClass.prototype, 'audioTracks', {
    get() { return initAudioTrackList(this); }
  });

  // There is video.addTextTrack so makes sense to add addVideoTrack and addAudioTrack

  if (!('addVideoTrack' in MediaElementClass.prototype)) {
    MediaElementClass.prototype.addVideoTrack = function (kind: string, label = '', language = '') {
      const videoTrackList = initVideoTrackList(this);
      const track = new VideoTrack();
      track.kind = kind;
      track.label = label;
      track.language = language;
      videoTrackList.add(track);
      return track;
    }
  }

  if (!('addAudioTrack' in MediaElementClass.prototype)) {
    MediaElementClass.prototype.addAudioTrack = function (kind: string, label = '', language = '') {
      const audioTrackList = initAudioTrackList(this);
      const track = new AudioTrack();
      track.kind = kind;
      track.label = label;
      track.language = language;
      audioTrackList.add(track);
      return track;
    }
  }

  const videoTrackLists = new WeakMap();
  const audioTrackLists = new WeakMap();

  const videoRenditionLists = new WeakMap();
  const audioRenditionLists = new WeakMap();

  const initVideoTrackList = (media: HTMLMediaElement) => {
    let tracks = videoTrackLists.get(media);
    if (!tracks) {
      tracks = new VideoTrackList();
      videoTrackLists.set(media, tracks);

      // Sync native tracks to shim tracks
      if (getNativeVideoTracks) {
        const nativeTracks = getNativeVideoTracks.call(media);

        for (const nativeTrack of nativeTracks) {
          tracks.add(nativeTrack);
        }

        nativeTracks.addEventListener('change', () => {
          tracks.dispatchEvent(new Event('change'));
        });

        nativeTracks.addEventListener('addtrack', (event: TrackEvent) => {
          // Note: adding native track instances to the shim track list here.
          // This works because the API is identical and change event is forwarded.
          // If tracks were manually added prevent native tracks from being added.
          if (![...tracks].some(t => t instanceof VideoTrack)) {
            tracks.add(event.track);
          }
        });

        nativeTracks.addEventListener('removetrack', (event: TrackEvent) => {
          tracks.remove(event.track);
        });
      }
    }
    return tracks;
  }

  const initAudioTrackList = (media: HTMLMediaElement) => {
    let tracks = audioTrackLists.get(media);
    if (!tracks) {
      tracks = new AudioTrackList();
      audioTrackLists.set(media, tracks);

      // Sync native tracks to shim tracks
      if (getNativeAudioTracks) {
        const nativeTracks = getNativeAudioTracks.call(media);

        for (const nativeTrack of nativeTracks) {
          tracks.add(nativeTrack);
        }

        nativeTracks.addEventListener('change', () => {
          tracks.dispatchEvent(new Event('change'));
        });

        nativeTracks.addEventListener('addtrack', (event: TrackEvent) => {
          // Note: adding native track instances to the shim track list here.
          // This works because the API is identical and change event is forwarded.
          // If tracks were manually added prevent native tracks from being added.
          if (![...tracks].some(t => t instanceof AudioTrack)) {
            tracks.add(event.track);
          }
        });

        nativeTracks.addEventListener('removetrack', (event: TrackEvent) => {
          tracks.remove(event.track);
        });
      }
    }
    return tracks;
  }

  if (globalThis.VideoTrack && !('renditions' in globalThis.VideoTrack.prototype)) {
    Object.defineProperty(globalThis.VideoTrack.prototype, 'renditions', {
      get() { return initVideoRenditionList(this); }
    });
  }

  if (globalThis.AudioTrack && !('renditions' in globalThis.AudioTrack.prototype)) {
    Object.defineProperty(globalThis.AudioTrack.prototype, 'renditions', {
      get() { return initAudioRenditionList(this); }
    });
  }

  const initVideoRenditionList = (track: VideoTrack) => {
    let renditions = videoRenditionLists.get(track);
    if (!renditions) {
      renditions = new VideoRenditionList();
      videoRenditionLists.set(track, renditions);
    }
    return renditions;
  }

  const initAudioRenditionList = (track: AudioTrack) => {
    let renditions = audioRenditionLists.get(track);
    if (!renditions) {
      renditions = new AudioRenditionList();
      audioRenditionLists.set(track, renditions);
    }
    return renditions;
  }
}
