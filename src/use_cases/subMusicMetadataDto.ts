export class SubMusicMetadataDto {
  constructor(
    public id: string,
    public title: string,
    public musicDurationSeconds: number,
    public musicDataBytes: number,
    public musicS3Path: string,
    public artworkS3Path: string,
  ) {}
}
