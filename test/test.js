import { fixture, assert, oneEvent, aTimeout } from '@open-wc/testing';
import '../src/polyfill.ts';
import {
  VideoTrackList,
  VideoRenditionList,
  AudioTrackList,
  AudioRenditionList
} from '../src/index.ts';

it('is an instance of VideoTrackList', async function () {
  const video = await fixture(`<video></video>`);
  assert(video.videoTracks instanceof VideoTrackList);
});

it('is an instance of AudioTrackList', async function () {
  const video = await fixture(`<video></video>`);
  assert(video.audioTracks instanceof AudioTrackList);
});

it('is an instance of VideoRenditionList', async function () {
  const video = await fixture(`<video></video>`);
  assert(video.videoRenditions instanceof VideoRenditionList);
});

it('is an instance of AudioRenditionList', async function () {
  const video = await fixture(`<video></video>`);
  assert(video.audioRenditions instanceof AudioRenditionList);
});

it('fires queued addtrack event', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  const event = await oneEvent(video.videoTracks, 'addtrack');
  assert.equal(track, event.track);
  assert.equal(video.videoTracks.length, 1);
});

it('fires queued removetrack event', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  video.removeVideoTrack(track);
  const event = await oneEvent(video.videoTracks, 'removetrack');
  assert.equal(track, event.track);
  assert.equal(video.videoTracks.length, 0);
});

it('fires queued addrendition event on selected track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  const rendtion = track.addRendition('http://', 1920, 1080);
  const event = await oneEvent(video.videoRenditions, 'addrendition');
  assert.equal(rendtion, event.rendition);
  assert.equal(video.videoRenditions.length, 1);
});

it('fires no addrendition event on unselected track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');

  track.addRendition('http://', 1920, 1080);
  await Promise.race([
    oneEvent(video.videoRenditions, 'addrendition'),
    aTimeout(200)
  ]);

  assert.equal(video.videoRenditions.length, 0);
});
