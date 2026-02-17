import type { MusicMetadata } from "@/domain/entities/musicMetadata";
import { SubMusicMetadataDto } from "./subMusicMetadataDto";

export const musicMetadataToSubMusicMetadataDto = (
  musicMetadata: MusicMetadata,
): SubMusicMetadataDto => {
  return new SubMusicMetadataDto(
    musicMetadata.id,
    musicMetadata.title,
    musicMetadata.musicDurationSeconds,
    musicMetadata.musicDataBytes,
    musicMetadata.musicDataPath.toString(),
    musicMetadata.artworkImagePath.toString(),
  );
};
