import { fixture, assert } from '@open-wc/testing';
import '../dist/media-shim.js';
import { VideoTrackList } from '../dist/video-track-list.js';

it('is an instance of VideoTrackList', async function () {
  const video = await fixture(`<video></video>`);
  assert(video.videoTracks instanceof VideoTrackList);
});
