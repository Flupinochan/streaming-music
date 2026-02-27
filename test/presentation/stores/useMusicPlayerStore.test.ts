import { useMusicPlayerStore } from "@/presentation/stores/useMusicPlayerStore";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

// mock howler's Howl constructor so tests don't attempt to play audio
vi.mock("howler", () => {
  return {
    Howl: vi.fn().mockImplementation((opts: any) => {
      return {
        play: vi.fn(),
        pause: vi.fn(),
        stop: vi.fn(),
        unload: vi.fn(),
        off: vi.fn(),
        duration: () => 123,
        seek: () => 0,
      };
    }),
  };
});

describe("useMusicPlayerStore", () => {
  let store: ReturnType<typeof useMusicPlayerStore>;
  const dummyUrl = new URL("http://example.com/song.mp3");

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useMusicPlayerStore();

    // provide a minimal fetchMusicUsecase implementation
    store.setFetchMusicUsecase({
      fetchMusic: (_dto: any) => Promise.resolve(dummyUrl),
    });

    // reset spies on window timer functions
    vi.restoreAllMocks();
  });

  it("restarts tick timer when switching tracks while playing", async () => {
    // prepare spies
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    // add two fake tracks
    const tracks = [
      {
        id: "1",
        title: "One",
        musicDataBytes: 0,
        musicDurationSeconds: 0,
        artworkUrl: "",
        artworkThumbnailUrl: "",
        musicS3Path: "",
      },
      {
        id: "2",
        title: "Two",
        musicDataBytes: 0,
        musicDurationSeconds: 0,
        artworkUrl: "",
        artworkThumbnailUrl: "",
        musicS3Path: "",
      },
    ];
    store.setTracks(tracks);

    // select first track and start playback
    await store.selectTrackById("1");
    store.play();

    expect(store.playerState.status).toBe("playing");
    // tick should have been started once
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).not.toHaveBeenCalled();

    // switch to second track while still playing
    await store.selectTrackById("2");

    // selecting a different track should clear the old tick and start a new one
    expect(clearIntervalSpy).toHaveBeenCalled();
    expect(setIntervalSpy).toHaveBeenCalledTimes(2);
  });

  it("does not clear tick or reload when selecting same track", async () => {
    const setIntervalSpy = vi.spyOn(window, "setInterval");
    const clearIntervalSpy = vi.spyOn(window, "clearInterval");

    const tracks = [
      {
        id: "1",
        title: "One",
        musicDataBytes: 0,
        musicDurationSeconds: 0,
        artworkUrl: "",
        artworkThumbnailUrl: "",
        musicS3Path: "",
      },
    ];

    store.setTracks(tracks);
    await store.selectTrackById("1");
    store.play();

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // select same id again, nothing should change
    await store.selectTrackById("1");
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).not.toHaveBeenCalled();
  });
});
