export class TrackEvent extends Event {
  track: any;

  constructor(type: string, init: Record<string, any>) {
    super(type);
    this.track = init.track;
  }
}
