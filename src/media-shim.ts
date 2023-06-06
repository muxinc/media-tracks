import { VideoTrack, VideoTrackKind } from './video-track.js';
import { VideoTrackList } from './video-track-list.js';
import { AudioTrack, AudioTrackKind } from './audio-track.js';
import { AudioTrackList } from './audio-track-list.js';

let mediaState = new WeakMap();

const getNativeVideoTracks = Object.getOwnPropertyDescriptor(
  HTMLMediaElement.prototype,
  'videoTracks'
)?.get;

const getNativeAudioTracks = Object.getOwnPropertyDescriptor(
  HTMLMediaElement.prototype,
  'audioTracks'
)?.get;

Object.defineProperty(HTMLMediaElement.prototype, 'videoTracks', {
  get() {
    // Safari does support `.videoTracks`
    const nativeVideoTracks = getNativeVideoTracks?.call(this);
    if (nativeVideoTracks) {
      return nativeVideoTracks;
    }
    return initVideoTrackList(this);
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'audioTracks', {
  get() {
    // Safari does support `.audioTracks`
    const nativeAudioTracks = getNativeAudioTracks?.call(this);
    if (nativeAudioTracks) {
      return nativeAudioTracks;
    }
    return initAudioTrackList(this);
  },
});

// There is video.addTextTrack so makes sense to add addVideoTrack and addAudioTrack

Object.defineProperty(HTMLMediaElement.prototype, 'addVideoTrack', {
  value: function (kind: string, label = '', language = '') {
    let videoTrackList = initVideoTrackList(this);
    const track = new VideoTrack();
    track.kind = kind;
    track.label = label;
    track.language = language;
    videoTrackList.addTrack(track);
    return track;
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'addAudioTrack', {
  value: function (kind: string, label = '', language = '') {
    let audioTrackList = initAudioTrackList(this);
    const track = new AudioTrack();
    track.kind = kind;
    track.label = label;
    track.language = language;
    audioTrackList.addTrack(track);
    return track;
  },
});

function initVideoTrackList(media: HTMLVideoElement) {
  let state = mediaState.get(media);
  if (!state) mediaState.set(media, (state = { trackIdCount: 0 }));

  let videoTrackList = state.videoTrackList;
  if (!videoTrackList) {
    videoTrackList = new VideoTrackList();
    state.videoTrackList = videoTrackList;

    let mainTrack: VideoTrack;
    const initMainTrack = () => {
      // If MediaSource is used the tracks and renditions should be added externally.
      // This logic is here to handle the simple progressive media case.
      if (
        ![...videoTrackList].find((t: VideoTrack) => t.kind === 'main') &&
        media.readyState >= HTMLMediaElement.HAVE_METADATA &&
        !media.currentSrc.startsWith('blob:')
      ) {
        mainTrack = (media as any).addVideoTrack(VideoTrackKind.main);
        mainTrack.id = `${++state.trackIdCount}`;

        const rendition = mainTrack.addRendition(
          media.currentSrc,
          media.videoWidth,
          media.videoHeight
        );
        rendition.selected = true;

        if (![...videoTrackList].some(track => track.selected)) {
          mainTrack.selected = true;
        }
      }
    };

    const destroyTrack = () => {
      if (mainTrack) {
        videoTrackList.removeTrack(mainTrack);
      }
    };

    initMainTrack();
    media.addEventListener('loadedmetadata', initMainTrack);
    media.addEventListener('emptied', destroyTrack);
  }

  return videoTrackList;
}

function initAudioTrackList(media: HTMLMediaElement) {
  let state = mediaState.get(media);
  if (!state) mediaState.set(media, (state = { trackIdCount: 0 }));

  let audioTrackList = state.audioTrackList;
  if (!audioTrackList) {
    audioTrackList = new AudioTrackList();
    state.audioTrackList = audioTrackList;

    let mainTrack: AudioTrack;
    const initMainTrack = () => {
      // If MediaSource is used the tracks and renditions should be added externally.
      // This logic is here to handle the simple progressive media case.
      if (
        ![...audioTrackList].find((t: AudioTrack) => t.kind === 'main') &&
        media.readyState >= HTMLMediaElement.HAVE_METADATA &&
        !media.currentSrc.startsWith('blob:')
      ) {
        mainTrack = (media as any).addAudioTrack(AudioTrackKind.main);
        mainTrack.id = `${++state.trackIdCount}`;

        const rendition = mainTrack.addRendition(media.src);
        rendition.selected = true;

        if (![...audioTrackList].some(track => track.selected)) {
          mainTrack.enabled = true;
        }
      }
    };

    const destroyTrack = () => {
      if (mainTrack) {
        audioTrackList.removeTrack(mainTrack);
      }
    };

    initMainTrack();
    media.addEventListener('loadedmetadata', initMainTrack);
    media.addEventListener('emptied', destroyTrack);
  }

  return audioTrackList;
}
