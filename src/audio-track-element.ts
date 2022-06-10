/* global globalThis */
import { AudioTrack } from './audio-track';

class AudioTrackElement extends HTMLElement {
  static observedAttributes = ['default', 'src', 'srclang', 'kind', 'label'];
  track?: AudioTrack;
  #isInit = false;

  constructor() {
    super();

    if (this.isConnected) {
      this.#init();
    }
  }

  #init() {
    if (this.#isInit) return;
    this.#isInit = true;

    this.track = new AudioTrack();
    this.track.language = this.srclang;
    this.track.kind = this.kind;
    this.track.label = this.label;
  }

  async connectedCallback() {
    if (!this.parentElement) return;

    if (this.parentElement.localName.includes('-')) {
      await customElements.whenDefined(this.parentElement.localName);
    }

    this.track = (this.parentElement as any).audioTracks.addTrack(this.track);

    // this.#trackableMedia.load();
  }

  disconnectedCallback() {
    // this.#trackableMedia.destroy() logic here?
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    this.#init();
  }

  get default() {
    return this.hasAttribute('default');
  }

  set default(val) {
    if (this.default == val) return;
    if (val === true) {
      this.setAttribute('default', '');
    } else {
      this.removeAttribute('default');
    }
  }

  get src() {
    return this.getAttribute('src') ?? undefined;
  }

  set src(val) {
    if (this.src == val) return;
    this.setAttribute('src', `${val}`);
  }

  get srclang() {
    return this.getAttribute('srclang') ?? undefined;
  }

  set srclang(val) {
    if (this.srclang == val) return;
    this.setAttribute('srclang', `${val}`);
  }

  get kind() {
    return this.getAttribute('kind') ?? undefined;
  }

  set kind(val) {
    if (this.kind == val) return;
    this.setAttribute('kind', `${val}`);
  }

  get label() {
    return this.getAttribute('label') ?? undefined;
  }

  set label(val) {
    if (this.label == val) return;
    this.setAttribute('label', `${val}`);
  }
}

if (!customElements.get('audio-track')) {
  customElements.define('audio-track', AudioTrackElement);
  (globalThis as any).AudioTrackElement = AudioTrackElement;
}

export { AudioTrackElement };
