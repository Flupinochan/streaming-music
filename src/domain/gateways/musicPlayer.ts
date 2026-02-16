export type MusicPlayerEvent = "load" | "play" | "pause" | "stop" | "end";

export interface MusicPlayer {
  play(): number | undefined;
  pause(): this;
  stop(): this;
  unload(): this;

  seek(): number;
  seek(positionSeconds: number): this;

  duration(): number;

  loop(): boolean;
  loop(value: boolean): this;

  on(event: MusicPlayerEvent, handler: () => void): this;
  off(event: MusicPlayerEvent, handler?: () => void): this;
}

export type MusicPlayerFactory = (args: {
  src: string;
  loop: boolean;
}) => MusicPlayer;
