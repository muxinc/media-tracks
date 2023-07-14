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

it('get video track with getTrackById', async function () {
  const video = await fixture(`<video></video>`);
  const track1 = video.addVideoTrack('main');
  track1.id = "1";
  const track2 = video.addVideoTrack('alternative');
  track2.id = "2";
  assert.equal(video.videoTracks.getTrackById("1"), track1);
  assert.equal(video.videoTracks.getTrackById("2"), track2);
});

it('get audio track with getTrackById', async function () {
  const video = await fixture(`<video></video>`);
  const track1 = video.addAudioTrack('main');
  track1.id = "1";
  const track2 = video.addAudioTrack('alternative');
  track2.id = "2";
  assert.equal(video.audioTracks.getTrackById("1"), track1);
  assert.equal(video.audioTracks.getTrackById("2"), track2);
});

it('fires queued addtrack event on video tracks', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('sign');
  const event = await oneEvent(video.videoTracks, 'addtrack');
  assert.equal(track, event.track, 'same event track');
  assert.equal(video.videoTracks.length, 1);
  assert.equal(video.videoTracks.selectedIndex, -1);
  assert.equal(track, video.videoTracks[0], 'same index track');
  assert.equal(track, [...video.videoTracks][0], 'same iterator track');
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
  assert.equal(video.videoTracks.selectedIndex, 0);
  const rendition = track.addRendition('https://', 1920, 1080);
  const event = await oneEvent(video.videoRenditions, 'addrendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.videoRenditions.length, 1);
  assert.equal(video.videoRenditions.selectedIndex, -1);
  assert.equal(rendition, video.videoRenditions[0]);
  assert.equal(rendition, [...video.videoRenditions][0]);
});

it('fires queued addrendition event on enabled audio track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');
  track.enabled = true;
  const rendition = track.addRendition('https://', 'aac');
  const event = await oneEvent(video.audioRenditions, 'addrendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.audioRenditions.length, 1);
  assert.equal(video.audioRenditions.selectedIndex, -1);
  assert.equal(rendition, video.audioRenditions[0]);
  assert.equal(rendition, [...video.audioRenditions][0]);
});

it('fires no addrendition event on unselected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');

  track.addRendition('https://', 1920, 1080);
  await Promise.race([
    oneEvent(video.videoRenditions, 'addrendition'),
    aTimeout(200)
  ]);

  assert.equal(video.videoRenditions.length, 0);
});

it('fires no addrendition event on unenabled audio track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');

  track.addRendition('https://');
  await Promise.race([
    oneEvent(video.audioRenditions, 'addrendition'),
    aTimeout(200)
  ]);

  assert.equal(video.audioRenditions.length, 0);
});

it('fires queued removerendition event on selected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  track.addRendition('https://', 1920, 1080);
  const rendition = track.addRendition('https://', 1920, 1080);
  track.removeRendition(rendition);
  const event = await oneEvent(video.videoRenditions, 'removerendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.videoRenditions.length, 1);
});

it('fires queued removerendition event on enabled audio track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');
  track.enabled = true;
  track.addRendition('https://');
  const rendition = track.addRendition('https://');
  track.removeRendition(rendition);
  const event = await oneEvent(video.audioRenditions, 'removerendition');
  assert.equal(rendition, event.rendition);
  assert.equal(video.audioRenditions.length, 1);
});

it('fires batched change event on selected video rendition', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  const r0 = track.addRendition('https://', 1920, 1080);
  const r1 = track.addRendition('https://', 1280, 720);

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
  const r0 = track.addRendition('https://', 'aac');
  const r1 = track.addRendition('https://', 'opus');

  video.audioRenditions.selectedIndex = 0;
  video.audioRenditions.selectedIndex = 1;
  video.audioRenditions.selectedIndex = 0;

  await oneEvent(video.audioRenditions, 'change');
  assert(r0.selected);
  assert(!r1.selected);
});

it('renditions of removed selected video tracks are not listed', async function () {
  const video = await fixture(`<video></video>`);

  const track = video.addVideoTrack('main');
  track.selected = true;
  track.addRendition('https://', 1920, 1080);
  track.addRendition('https://', 1280, 720);
  assert.equal(video.videoRenditions.length, 2);

  video.removeVideoTrack(track);

  const track2 = video.addVideoTrack('commentary');
  track2.selected = true;
  assert.equal(video.videoTracks.length, 1);

  track2.addRendition('https://', 1920, 1080);
  track2.addRendition('https://', 1280, 720);

  assert.equal(video.videoRenditions.length, 2);
});

it('renditions of removed enabled audio tracks are not listed', async function () {
  const video = await fixture(`<video></video>`);

  const track = video.addAudioTrack('main');
  track.enabled = true;
  track.addRendition('https://', 'aac');
  track.addRendition('https://', 'opus');
  assert.equal(video.audioRenditions.length, 2);

  video.removeAudioTrack(track);

  const track2 = video.addAudioTrack('commentary');
  track2.enabled = true;
  assert.equal(video.audioTracks.length, 1);

  track2.addRendition('https://', 'aac');
  track2.addRendition('https://', 'opus');

  assert.equal(video.audioRenditions.length, 2);
});

it('fires queued addrendition callback on enabled audio track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addAudioTrack('main');
  track.enabled = true;
  await new Promise(resolve => (video.audioTracks.onaddtrack = resolve));
  track.addRendition('https://', 'aac');
  await new Promise(resolve => (video.audioRenditions.onaddrendition = resolve));
  assert(true);
});

it('fires queued addrendition callback on selected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  await new Promise(resolve => (video.videoTracks.onaddtrack = resolve));
  track.addRendition('https://', 1920, 1080);
  await new Promise(resolve => (video.videoRenditions.onaddrendition = resolve));
  assert(true);
});

it('fires queued removerendition callback on selected video track', async function () {
  const video = await fixture(`<video></video>`);
  const track = video.addVideoTrack('main');
  track.selected = true;
  await new Promise(resolve => (video.videoTracks.onaddtrack = resolve));
  track.addRendition('https://', 1920, 1080);
  const rendition = track.addRendition('https://', 1920, 1080);
  track.removeRendition(rendition);
  await new Promise(resolve => (video.videoRenditions.onremoverendition = resolve));
  assert(true);
});
