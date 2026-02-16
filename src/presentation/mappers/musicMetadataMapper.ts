import type { MusicMetadataDto } from "@/presentation/dto/musicMetadataDto";

export type MusicMetadataSource = {
  id: string;
  title: string;
  durationSeconds: number;
  fileSize: number;
  s3Path: string;
  artworkS3Path?: string | null;
};

export const toMusicMetadataDto = (
  src: MusicMetadataSource,
): MusicMetadataDto => ({
  id: src.id,
  title: src.title,
  durationSeconds: src.durationSeconds,
  fileSize: src.fileSize,
  s3Path: src.s3Path,
  artworkS3Path: src.artworkS3Path ?? null,
});

export const toMusicMetadataEntityLike = (
  dto: MusicMetadataDto,
): MusicMetadataSource => ({
  id: dto.id,
  title: dto.title,
  durationSeconds: dto.durationSeconds,
  fileSize: dto.fileSize,
  s3Path: dto.s3Path,
  artworkS3Path: dto.artworkS3Path ?? null,
});
