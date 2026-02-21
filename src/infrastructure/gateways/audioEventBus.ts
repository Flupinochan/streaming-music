import mitt from "mitt";

export type AudioEvents = {
  play: undefined;
  pause: undefined;
  stop: undefined;
  end: undefined;
  loaded: { duration: number };
  position: { position: number; duration: number };
};

export const audioEvent = mitt<AudioEvents>();
