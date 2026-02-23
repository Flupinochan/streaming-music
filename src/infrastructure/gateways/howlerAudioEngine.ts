import type { AudioEngine } from "@/domain/gateways/audioEngine2";
import { Howl } from "howler";
import { audioEvent } from "./audioEventBus";

export class HowlerAudioEngine implements AudioEngine {
  private currentUrl: URL | undefined = undefined;
  private howl: Howl | undefined = undefined;
  private endHandler: (() => void) | undefined = undefined;
  private tickId: number | undefined = undefined;
  private internalEndHandler: (() => void) | undefined = undefined;

  load(url: URL): void {
    if (this.howl && this.currentUrl === url) return;

    this.dispose();
    this.currentUrl = url;

    this.howl = new Howl({
      src: [url.toString()],
      html5: true,
      pool: 1,
      onload: (): void => {
        audioEvent.emit("loaded", { duration: this.getDuration() });
      },
    });

    // attach internal end handler that also calls external handler
    this.internalEndHandler = (): void => {
      audioEvent.emit("end");
      if (this.endHandler) this.endHandler();
    };
    this.howl.on("end", this.internalEndHandler);
  }

  play(): void {
    this.howl?.play();
    audioEvent.emit("play");
    this.startTick();
  }

  pause(): void {
    this.howl?.pause();
    audioEvent.emit("pause");
    this.clearTick();
  }

  stop(): void {
    this.howl?.stop();
    audioEvent.emit("stop");
    this.clearTick();
  }

  seek(seconds: number): void {
    this.howl?.seek(Math.max(0, seconds));
    audioEvent.emit("position", {
      position: this.getPosition(),
      duration: this.getDuration(),
    });
  }

  getPosition(): number {
    if (!this.howl) return 0;
    const value = this.howl.seek();
    return typeof value === "number" ? value : 0;
  }

  getDuration(): number {
    return this.howl?.duration() ?? 0;
  }

  // 曲の終了時のイベントハンドラを登録
  onEnd(handler: () => void): void {
    this.endHandler = handler;
    // internalEndHandler will call this.endHandler when end happens
  }

  // リソース解放
  dispose(): void {
    if (!this.howl) return;
    if (this.internalEndHandler) {
      this.howl.off("end", this.internalEndHandler);
    }
    this.clearTick();
    this.howl.stop();
    this.howl.unload();
    this.howl = undefined;
    this.currentUrl = undefined;
  }

  private startTick(): void {
    if (this.tickId !== undefined) return;
    this.tickId = window.setInterval(() => {
      audioEvent.emit("position", {
        position: this.getPosition(),
        duration: this.getDuration(),
      });
    }, 500);
  }

  private clearTick(): void {
    if (this.tickId === undefined) return;
    clearInterval(this.tickId);
    this.tickId = undefined;
  }
}
