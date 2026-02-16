export interface MusicMetadataDto {
  id: string;
  title: string;
  durationSeconds: number;
  fileSize: number;
  s3Path: string;
  artworkS3Path?: string | null;
}
