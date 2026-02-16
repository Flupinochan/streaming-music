import type { ArtworkImagePath } from "../value_objects/artworkImagePath";
import type { MusicDataPath } from "../value_objects/musicDataPath";

// DynamoDBに保存する音楽のメタデータ
export class MusicMetadata {
  constructor(
    public readonly id: string | undefined,
    public readonly title: string,
    public readonly musicDurationSeconds: number,
    public readonly musicDataBytes: number,
    public readonly musicDataPath: MusicDataPath,
    public readonly artworkImagePath: ArtworkImagePath,
  ) {}

  public getFileSizeInMB(): string {
    return (this.musicDataBytes / 1024 / 1024).toFixed(2) + " MB";
  }

  public getDurationFormatted(): string {
    const minutes = Math.floor(this.musicDurationSeconds / 60);
    const seconds = this.musicDurationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
