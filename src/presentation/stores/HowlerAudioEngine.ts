import { Howl } from "howler";
import type { IAudioEngine } from "./IMusicPlayer";

export class HowlerAudioEngine implements IAudioEngine {
  private howl: Howl | undefined = undefined;
  private endHandler: (() => void) | undefined = undefined;

  load(url: string): void {
    this.dispose();
    this.howl = new Howl({
      src: [url],
      html5: true,
      pool: 1,
    });

    if (this.endHandler) {
      this.howl.on("end", this.endHandler);
    }
  }

  play(): void {
    this.howl?.play();
  }

  pause(): void {
    this.howl?.pause();
  }

  stop(): void {
    this.howl?.stop();
  }

  seek(seconds: number): void {
    this.howl?.seek(Math.max(0, seconds));
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
    if (this.howl && this.endHandler) {
      this.howl.off("end", this.endHandler);
    }
    this.endHandler = handler;
    if (!this.howl) return;
    this.howl.on("end", handler);
  }

  // リソース解放
  dispose(): void {
    if (!this.howl) return;
    this.howl.stop();
    this.howl.unload();
    this.howl = undefined;
  }
}
