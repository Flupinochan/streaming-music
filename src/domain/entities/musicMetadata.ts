import type { ArtworkImagePath } from "../value_objects/artworkImagePath";
import type { MusicDataPath } from "../value_objects/musicDataPath";

// DynamoDBに保存する音楽のメタデータ
export class MusicMetadata {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly musicDurationSeconds: number,
    public readonly musicDataBytes: number,
    public readonly musicDataPath: MusicDataPath,
    public readonly artworkImagePath: ArtworkImagePath,
  ) {}

  // 作成時はIDがないためIDを生成するが、Amplify側がIDを生成するため利用していない
  static create(
    title: string,
    musicDurationSeconds: number,
    musicDataBytes: number,
    musicDataPath: MusicDataPath,
    artworkImagePath: ArtworkImagePath,
  ): MusicMetadata {
    return new MusicMetadata(
      crypto.randomUUID(),
      title,
      musicDurationSeconds,
      musicDataBytes,
      musicDataPath,
      artworkImagePath,
    );
  }

  public getFileSizeInMB(): string {
    return (this.musicDataBytes / 1024 / 1024).toFixed(2) + " MB";
  }

  public getDurationFormatted(): string {
    const minutes = Math.floor(this.musicDurationSeconds / 60);
    const seconds = this.musicDurationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}
