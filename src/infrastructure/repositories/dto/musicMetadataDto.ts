export class MusicMetadataDto {
  public readonly id?: string | undefined;
  public readonly title: string;
  public readonly musicDurationSeconds: number;
  public readonly musicDataBytes: number;
  public readonly musicS3Path: string;
  public readonly artworkS3Path: string;

  constructor(
    title: string,
    musicDurationSeconds: number,
    musicDataBytes: number,
    musicS3Path: string,
    artworkS3Path: string,
    id?: string | undefined,
  ) {
    this.title = title;
    this.musicDurationSeconds = musicDurationSeconds;
    this.musicDataBytes = musicDataBytes;
    this.musicS3Path = musicS3Path;
    this.artworkS3Path = artworkS3Path;
    this.id = id;
  }
}
