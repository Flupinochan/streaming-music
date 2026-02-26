export class MusicMetadataDto {
  constructor(
    public id: string,
    public title: string,
    public musicDurationSeconds: number,
    public musicDataBytes: number,
    public musicS3Path: string,
    public artworkS3Path: string,
    public artworkThumbnailS3Path: string,
  ) {}
}
