import { MusicMetadata } from "@/domain/entities/musicMetadata";
import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type {
  AmplifyMusicMetadataCreateInput,
  AmplifyMusicMetadataItem,
} from "@/infrastructure/repositories/amplifyClient";
import { MusicMetadataDto } from "@/infrastructure/repositories/dto/musicMetadataDto";

// Entity to DTO
export const musicMetadataToMusicMetadataDto = (
  musicMetadata: MusicMetadata,
): MusicMetadataDto => {
  return new MusicMetadataDto(
    musicMetadata.id,
    musicMetadata.title,
    musicMetadata.musicDurationSeconds,
    musicMetadata.musicDataBytes,
    musicMetadata.musicDataPath.toString(),
    musicMetadata.artworkImagePath.toString(),
  );
};

// DTO to Entity
export const musicMetadataDtoToMusicMetadata = (
  dto: MusicMetadataDto,
): MusicMetadata => {
  return new MusicMetadata(
    dto.id,
    dto.title,
    dto.musicDurationSeconds,
    dto.musicDataBytes,
    new MusicDataPath(dto.musicS3Path),
    new ArtworkImagePath(dto.artworkS3Path),
  );
};

// Amplify Model -> DTO
export const amplifyModelToMusicMetadataDto = (
  item: AmplifyMusicMetadataItem,
): MusicMetadataDto => {
  return new MusicMetadataDto(
    item.id,
    item.title,
    item.musicDurationSeconds,
    item.musicDataBytes,
    item.musicDataPath,
    item.artworkImagePath,
  );
};

// DTO -> Create Amplify Model
export const musicMetadataDtoToCreateAmplifyModel = (
  dto: MusicMetadataDto,
): AmplifyMusicMetadataCreateInput => ({
  title: dto.title,
  musicDurationSeconds: dto.musicDurationSeconds,
  musicDataBytes: dto.musicDataBytes,
  musicDataPath: dto.musicS3Path,
  artworkImagePath: dto.artworkS3Path,
});
