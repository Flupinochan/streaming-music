import { MusicMetadata } from "@/domain/entities/musicMetadata";
import { CreateMusicMetadataRequestDto } from "@/infrastructure/repositories/dto/musicMetadataApiDtos";

export const toCreateMusicMetadataRequestDto = (
  entity: MusicMetadata,
): CreateMusicMetadataRequestDto => {
  return new CreateMusicMetadataRequestDto(
    entity.id.toString(),
    entity.title,
    entity.musicDurationSeconds,
    entity.musicDataBytes,
    entity.musicDataPath.toString(),
    entity.artworkImagePath.toString(),
  );
};
