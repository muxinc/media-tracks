# Media Tracks

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

class VideoRenditionList extends EventTarget {
    [Symbol.iterator](): IterableIterator<VideoRendition>;
    get length(): number;
    add(rendition: VideoRendition): void;
    remove(rendition: VideoRendition): void;
    getRenditionById(id: string): VideoRendition | null;
    get activeIndex(): number;
    get onaddrendition(): (() => void) | undefined;
    set onaddrendition(callback: (() => void) | undefined);
    get onremoverendition(): (() => void) | undefined;
    set onremoverendition(callback: (() => void) | undefined);
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
    [Symbol.iterator](): IterableIterator<VideoRendition>;
    get length(): number;
    add(rendition: VideoRendition): void;
    remove(rendition: VideoRendition): void;
    getRenditionById(id: string): VideoRendition | null;
    get activeIndex(): number;
    get onaddrendition(): (() => void) | undefined;
    set onaddrendition(callback: (() => void) | undefined);
    get onremoverendition(): (() => void) | undefined;
    set onremoverendition(callback: (() => void) | undefined);
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
    get active(): boolean;
    set active(val: boolean);
}
```

