import type { ArtworkImagePath } from "../value_objects/artworkImagePath";
import type { ArtworkThumbnailImagePath } from "../value_objects/artworkThumbnailImagePath";
import type { MusicDataPath } from "../value_objects/musicDataPath";
import { TrackId } from "../value_objects/trackId";

// DynamoDBに保存する音楽のメタデータ
export class MusicMetadata {
  constructor(
    public readonly id: TrackId,
    public readonly title: string,
    public readonly musicDurationSeconds: number,
    public readonly musicDataBytes: number,
    public readonly musicDataPath: MusicDataPath,
    public readonly artworkImagePath: ArtworkImagePath,
    public readonly artworkThumbnailImagePath: ArtworkThumbnailImagePath,
  ) {}

  static create(
    title: string,
    musicDurationSeconds: number,
    musicDataBytes: number,
    musicDataPath: MusicDataPath,
    artworkImagePath: ArtworkImagePath,
    artworkThumbnailImagePath: ArtworkThumbnailImagePath,
  ): MusicMetadata {
    return new MusicMetadata(
      TrackId.create(crypto.randomUUID()),
      title,
      musicDurationSeconds,
      musicDataBytes,
      musicDataPath,
      artworkImagePath,
      artworkThumbnailImagePath,
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
