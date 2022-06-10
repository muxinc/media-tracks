import { VideoTrack, VideoTrackKind } from './video-track';
import { VideoTrackList } from './video-track-list';
import { AudioTrack, AudioTrackKind } from './audio-track';
import { AudioTrackList } from './audio-track-list';

let trackIdCount = 0;
const videoTrackLists = new WeakMap();
const audioTrackLists = new WeakMap();

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
    // const nativeVideoTracks = getNativeVideoTracks?.call(this);
    // if (nativeVideoTracks) {
    //   console.log(99);
    //   return nativeVideoTracks;
    // }
    return initVideoTrackList(this);
  },
});

Object.defineProperty(HTMLMediaElement.prototype, 'audioTracks', {
  get() {
    // Safari does support `.audioTracks`
    // const nativeAudioTracks = getNativeAudioTracks?.call(this);
    // if (nativeAudioTracks) {
    //   console.log(99);
    //   return nativeAudioTracks;
    // }
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

function initVideoTrackList(video: HTMLVideoElement) {
  let videoTrackList = videoTrackLists.get(video);
  if (!videoTrackList) {
    videoTrackList = new VideoTrackList();
    videoTrackLists.set(video, videoTrackList);

    const initMainTrack = () => {
      if (
        ![...videoTrackList].find((t: VideoTrack) => t.kind === 'main') &&
        video.readyState >= HTMLMediaElement.HAVE_METADATA
      ) {
        const track = (video as any).addVideoTrack(VideoTrackKind.main);
        track.id = ++trackIdCount;

        // const rendition = track.addRendition(
        //   video.videoWidth,
        //   video.videoHeight
        // );
        // rendition.id = '1';
        // rendition.selected = true;

        track.selected = true;
      }
    };

    const destroyTracks = () => {
      [...videoTrackList].forEach((track) => videoTrackList.removeTrack(track));
    };

    initMainTrack();
    video.addEventListener('loadedmetadata', initMainTrack);
    video.addEventListener('emptied', destroyTracks);
  }

  return videoTrackList;
}

function initAudioTrackList(audio: HTMLAudioElement) {
  let audioTrackList = audioTrackLists.get(audio);
  if (!audioTrackList) {
    audioTrackList = new AudioTrackList();
    audioTrackLists.set(audio, audioTrackList);

    const initMainTrack = () => {
      if (
        ![...audioTrackList].find((t: AudioTrack) => t.kind === 'main') &&
        audio.readyState >= HTMLMediaElement.HAVE_METADATA
      ) {
        const track = (audio as any).addAudioTrack(AudioTrackKind.main);
        track.id = ++trackIdCount;

        // const rendition = track.addRendition();
        // rendition.id = '1';
        // rendition.selected = true;

        track.enabled = true;
      }
    };

    const destroyTracks = () => {
      [...audioTrackList].forEach((track) => audioTrackList.removeTrack(track));
    };

    initMainTrack();
    audio.addEventListener('loadedmetadata', initMainTrack);
    audio.addEventListener('emptied', destroyTracks);
  }

  return audioTrackList;
}
