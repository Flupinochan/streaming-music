export class CreateMusicMetadataRequestDto {
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
  ) {
    this.title = title;
    this.musicDurationSeconds = musicDurationSeconds;
    this.musicDataBytes = musicDataBytes;
    this.musicS3Path = musicS3Path;
    this.artworkS3Path = artworkS3Path;
  }
}

export class MusicMetadataResponseDto {
  public readonly id: string;
  public readonly title: string;
  public readonly musicDurationSeconds: number;
  public readonly musicDataBytes: number;
  public readonly musicS3Path: string;
  public readonly artworkS3Path: string;

  constructor(
    id: string,
    title: string,
    musicDurationSeconds: number,
    musicDataBytes: number,
    musicS3Path: string,
    artworkS3Path: string,
  ) {
    this.id = id;
    this.title = title;
    this.musicDurationSeconds = musicDurationSeconds;
    this.musicDataBytes = musicDataBytes;
    this.musicS3Path = musicS3Path;
    this.artworkS3Path = artworkS3Path;
  }
}
