export class RenditionEvent extends Event {
  rendition: any;

  constructor(type: string, init: Record<string, any>) {
    super(type);
    this.rendition = init.rendition;
  }
}
