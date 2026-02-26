export class CreateMusicMetadataRequestDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly musicDurationSeconds: number,
    public readonly musicDataBytes: number,
    public readonly musicS3Path: string,
    public readonly artworkS3Path: string,
    public readonly artworkThumbnailS3Path: string,
  ) {}
}

export class MusicMetadataResponseDto {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly musicDurationSeconds: number,
    public readonly musicDataBytes: number,
    public readonly musicS3Path: string,
    public readonly artworkS3Path: string,
    public readonly artworkThumbnailS3Path: string,
  ) {}
}
