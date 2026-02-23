import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  MusicPlayer,
  PlayerState,
  RepeatMode,
  Track,
} from "../../domain/gateways/musicPlayer";
import { Seconds } from "../../domain/value_objects/seconds";
import { TrackId } from "../../domain/value_objects/trackId";
import { audioEvent } from "../../infrastructure/gateways/audioEventBus";

export const useMusicPlayerStore = defineStore("musicPlayer", () => {
  let musicPlayer: MusicPlayer | undefined = undefined;
  const playerState = ref<PlayerState>({
    status: "stopped",
    currentTrackId: undefined,
    positionSeconds: Seconds.createFromSeconds(0),
    durationSeconds: Seconds.createFromSeconds(0),
    repeatMode: "none",
    shuffleEnabled: false,
  });

  const getMusicPlayer = (): MusicPlayer => {
    if (!musicPlayer) {
      throw new Error(
        "MusicPlayer is not set. Call useMusicPlayerStore(pinia).setMusicPlayerFactory() in main.ts.",
      );
    }
    return musicPlayer;
  };

  const setMusicPlayer = (value: MusicPlayer): void => {
    musicPlayer = value;
  };
  audioEvent.on("play", () => {
    playerState.value = { ...playerState.value, status: "playing" };
  });
  audioEvent.on("pause", () => {
    playerState.value = { ...playerState.value, status: "paused" };
  });
  audioEvent.on("stop", () => {
    playerState.value = { ...playerState.value, status: "stopped" };
  });
  audioEvent.on("end", () => {
    playerState.value = { ...playerState.value, status: "stopped" };
  });
  audioEvent.on("loaded", ({ duration }) => {
    playerState.value = {
      ...playerState.value,
      durationSeconds: Seconds.createFromSeconds(duration),
    };
  });
  audioEvent.on("position", ({ position, duration }) => {
    playerState.value = {
      ...playerState.value,
      positionSeconds: Seconds.createFromSeconds(position),
      durationSeconds: Seconds.createFromSeconds(duration),
    };
  });

  const getPlayerState = (): PlayerState => {
    return playerState.value as PlayerState;
  };

  const isPlaying = (): boolean => {
    return playerState.value.status === "playing";
  };

  const play = (): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.play();
    playerState.value = { ...playerState.value, status: "playing" };
  };

  const pause = (): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.pause();
    playerState.value = { ...playerState.value, status: "paused" };
  };

  const stop = (): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.stop();
    playerState.value = { ...playerState.value, status: "stopped" };
  };

  const setRepeadMode = (repeadMode: RepeatMode): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.setRepeatMode(repeadMode);
    playerState.value = { ...playerState.value, repeatMode: repeadMode };
  };

  const toggleShuffle = (): void => {
    const musicPlayer = getMusicPlayer();
    const current = playerState.value.shuffleEnabled;
    musicPlayer.setShuffle(!current);
    playerState.value = { ...playerState.value, shuffleEnabled: !current };
  };

  const seek = (seconds: number): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.seek(Seconds.createFromSeconds(seconds));
  };

  const setTracks = (tracks: Track[]): void => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.setTracks(tracks);
  };

  const selectTrack = async (trackId: string): Promise<void> => {
    const musicPlayer = getMusicPlayer();
    await musicPlayer.selectTrack(TrackId.create(trackId));
    playerState.value = {
      ...playerState.value,
      currentTrackId: TrackId.create(trackId),
      positionSeconds: Seconds.createFromSeconds(0),
    };
  };

  return {
    playerState,
    getPlayerState,
    getMusicPlayer,
    setMusicPlayer,
    isPlaying,
    play,
    pause,
    stop,
    setRepeadMode,
    toggleShuffle,
    seek,
    setTracks,
    selectTrack,
  };
});
