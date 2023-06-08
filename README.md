# Media Tracks

This project is the first step to introduce a native way to add a configurable list of renditions to a video element.

We first need to patch the media tracks API's so they work cross browser and then we can add the renditions to the main video and audio track.

This answer makes a lot of sense IMO https://github.com/video-dev/media-ui-extensions/issues/1#issuecomment-944036534

While we're add it we can entertain the idea to introduce a `<video-track>` and `<audio-track>` custom element to configure media tracks in HTML.
