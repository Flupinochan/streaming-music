import type {
  MusicPlayer,
  MusicPlayerFactory,
} from "@/domain/gateways/musicPlayer";
import { Howl } from "howler";

export const createHowlerMusicPlayer: MusicPlayerFactory = ({ src, loop }) => {
  return new Howl({
    src: [src],
    html5: true,
    loop,
    pool: 1,
  }) as unknown as MusicPlayer;
};
