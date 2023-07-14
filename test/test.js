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

it('fires queued addrendition event on selected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  const rendition = track.addRendition('http://', 1920, 1080);
  const event = await oneEvent(video.videoRenditions, 'addrendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.videoRenditions.length, 1);
});

it('fires queued addrendition event on enabled audio track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');
  track.enabled = true;
  const rendition = track.addRendition('http://', 'aac');
  const event = await oneEvent(video.audioRenditions, 'addrendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.audioRenditions.length, 1);
});

it('fires no addrendition event on unselected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');

  track.addRendition('http://', 1920, 1080);
  await Promise.race([
    oneEvent(video.videoRenditions, 'addrendition'),
    aTimeout(200)
  ]);

  assert.equal(video.videoRenditions.length, 0);
});

it('fires queued removerendition event on selected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  track.addRendition('http://', 1920, 1080);
  const rendition = track.addRendition('http://', 1920, 1080);
  track.removeRendition(rendition);
  const event = await oneEvent(video.videoRenditions, 'removerendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.videoRenditions.length, 1);
});

it('fires batched change event on selected video rendition', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  const r0 = track.addRendition('http://', 1920, 1080);
  const r1 = track.addRendition('http://', 1280, 720);

  video.videoRenditions.selectedIndex = 0;
  video.videoRenditions.selectedIndex = 1;
  video.videoRenditions.selectedIndex = 0;

  await oneEvent(video.videoRenditions, 'change');
  assert(r0.selected);
  assert(!r1.selected);
});

it('fires batched change event on selected audio rendition', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');
  track.enabled = true;
  const r0 = track.addRendition('http://', 'aac');
  const r1 = track.addRendition('http://', 'opus');

  video.audioRenditions.selectedIndex = 0;
  video.audioRenditions.selectedIndex = 1;
  video.audioRenditions.selectedIndex = 0;

  await oneEvent(video.audioRenditions, 'change');
  assert(r0.selected);
  assert(!r1.selected);
});

it('renditions of removed tracks are not listed', async function () {
  const video = await fixture(`<video></video>`);

  const track = video.addVideoTrack('main');
  track.selected = true;
  track.addRendition('http://', 1920, 1080);
  track.addRendition('http://', 1280, 720);
  assert.equal(video.videoRenditions.length, 2);

  video.removeVideoTrack(track);

  const track2 = video.addVideoTrack('commentary');
  track2.selected = true;
  assert.equal(video.videoTracks.length, 1);

  track2.addRendition('http://', 1920, 1080);
  track2.addRendition('http://', 1280, 720);

  assert.equal(video.videoRenditions.length, 2);
});
