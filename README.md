# Media Tracks

[![Version](https://img.shields.io/npm/v/media-tracks?style=flat-square)](https://www.npmjs.com/package/media-tracks) 
[![Badge size](https://img.badgesize.io/https://cdn.jsdelivr.net/npm/media-tracks/+esm?compression=gzip&label=gzip&style=flat-square)](https://cdn.jsdelivr.net/npm/media-tracks/+esm)


Polyfills the media elements (`<audio>` or `<video>`) adding audio and video tracks (as [specced](https://html.spec.whatwg.org/multipage/media.html#media-resources-with-multiple-media-tracks)) and with renditions as proposed in [media-ui-extensions](https://github.com/video-dev/media-ui-extensions).

- Allows media engines like [hls.js](https://github.com/video-dev/hls.js)
or [shaka](https://github.com/shaka-project/shaka-player) to add media tracks w/
renditions from the information they retrieve from the manifest to a standardized
API.
- Allows media UI implementations like [media-chrome](https://github.com/muxinc/media-chrome) to consume this uniform API and render media track selection menus
and rendition (quality) selection menus.


## Caveats

- iOS does not support manual rendition switching as it is using a native
  HLS implementation. This library can't change anything about that. 

## Interfaces

```ts
declare global {
    interface HTMLMediaElement {
        audioTracks: AudioTrackList;
        videoTracks: VideoTrackList;
        addAudioTrack(kind: string, label?: string, language?: string): AudioTrack;
        addVideoTrack(kind: string, label?: string, language?: string): VideoTrack;
    }
}

declare class AudioTrackList extends EventTarget {
    [index: number]: AudioTrack;
    [Symbol.iterator](): IterableIterator<AudioTrack>;
    get length(): number;
    add(track: AudioTrack): void;
    remove(track: AudioTrack): void;
    getTrackById(id: string): AudioTrack | null;
    get onaddtrack(): ((event?: { track: AudioTrack }) => void) | undefined;
    set onaddtrack(callback: ((event?: { track: AudioTrack }) => void) | undefined);
    get onremovetrack(): ((event?: { track: AudioTrack }) => void) | undefined;
    set onremovetrack(callback: ((event?: { track: AudioTrack }) => void) | undefined);
    get onchange(): (() => void) | undefined;
    set onchange(callback: (() => void) | undefined);
}

declare const AudioTrackKind: {
    alternative: string;
    descriptions: string;
    main: string;
    'main-desc': string;
    translation: string;
    commentary: string;
};

declare class AudioTrack {
    id?: string;
    kind?: string;
    label: string;
    language: string;
    sourceBuffer?: SourceBuffer;
    addRendition(src: string, codec?: string, bitrate?: number): AudioRendition;
    get renditions(): AudioRenditionList;
    get enabled(): boolean;
    set enabled(val: boolean);
}

declare class VideoTrackList extends EventTarget {
    [index: number]: VideoTrack;
    [Symbol.iterator](): IterableIterator<VideoTrack>;
    get length(): number;
    add(track: VideoTrack): void;
    remove(track: VideoTrack): void;
    getTrackById(id: string): VideoTrack | null;
    get selectedIndex(): number;
    get onaddtrack(): ((event?: { track: VideoTrack }) => void) | undefined;
    set onaddtrack(callback: ((event?: { track: VideoTrack }) => void) | undefined);
    get onremovetrack(): ((event?: { track: VideoTrack }) => void) | undefined;
    set onremovetrack(callback: ((event?: { track: VideoTrack }) => void) | undefined);
    get onchange(): (() => void) | undefined;
    set onchange(callback: (() => void) | undefined);
}

declare const VideoTrackKind: {
    alternative: string;
    captions: string;
    main: string;
    sign: string;
    subtitles: string;
    commentary: string;
};

declare class VideoTrack {
    id?: string;
    kind?: string;
    label: string;
    language: string;
    sourceBuffer?: SourceBuffer;
    addRendition(src: string, width?: number, height?: number, codec?: string, bitrate?: number, frameRate?: number): VideoRendition;
    get renditions(): VideoRenditionList;
    get selected(): boolean;
    set selected(val: boolean);
}

declare class VideoRenditionList extends EventTarget {
    [index: number]: VideoRendition;
    [Symbol.iterator](): IterableIterator<VideoRendition>;
    get length(): number;
    add(rendition: VideoRendition): void;
    remove(rendition: VideoRendition): void;
    getRenditionById(id: string): VideoRendition | null;
    get onaddrendition(): ((event?: { track: VideoRendition }) => void) | undefined;
    set onaddrendition(callback: ((event?: { track: VideoRendition }) => void) | undefined);
    get onremoverendition(): ((event?: { track: VideoRendition }) => void) | undefined;
    set onremoverendition(callback: ((event?: { track: VideoRendition }) => void) | undefined);
    get onchange(): (() => void) | undefined;
    set onchange(callback: (() => void) | undefined);
}

export declare class VideoRendition {
    src?: string;
    id?: string;
    width?: number;
    height?: number;
    bitrate?: number;
    frameRate?: number;
    codec?: string;
    get enabled(): boolean;
    set enabled(val: boolean);
}
```
