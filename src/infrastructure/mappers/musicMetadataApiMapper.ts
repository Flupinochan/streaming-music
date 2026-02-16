import { MusicMetadata } from "@/domain/entities/musicMetadata";
import { CreateMusicMetadataRequestDto } from "@/infrastructure/dto/musicMetadataApiDtos";

export const toCreateMusicMetadataRequestDto = (
  entity: Omit<MusicMetadata, "id">,
): CreateMusicMetadataRequestDto => {
  return new CreateMusicMetadataRequestDto(
    entity.title,
    entity.musicDurationSeconds,
    entity.musicDataBytes,
    entity.musicDataPath.toString(),
    entity.artworkImagePath.toString(),
  );
};
