import { VideoTrack, VideoTrackKind } from './video-track';
import { VideoTrackList } from './video-track-list';

const videoTrackLists = new WeakMap();

const getNativeVideoTracks = Object.getOwnPropertyDescriptor(
  HTMLMediaElement.prototype,
  'videoTracks'
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

function initVideoTrackList(video: HTMLMediaElement) {
  let videoTrackList = videoTrackLists.get(video);
  if (!videoTrackList) {
    videoTrackList = new VideoTrackList();
    videoTrackLists.set(video, videoTrackList);

    const initMainTrack = () => {
      if (
        !videoTrackList.length &&
        video.readyState >= HTMLMediaElement.HAVE_METADATA
      ) {
        const track = (video as any).addVideoTrack(VideoTrackKind.main);
        track.id = '1';
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
