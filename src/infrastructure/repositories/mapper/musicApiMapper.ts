import { BinaryObject } from "@/domain/entities/binaryObject";
import type { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import type { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import {
  UploadArtworkImageInputDto,
  UploadMusicDataInputDto,
} from "@/infrastructure/repositories/dto/musicDataApiDtos";
import { binaryObjectToBinaryObjectDto } from "@/infrastructure/repositories/mapper/binaryObjectMapper";

export const createUploadMusicDto = (
  musicDataPath: MusicDataPath,
  musicData: BinaryObject,
): UploadMusicDataInputDto => {
  return new UploadMusicDataInputDto(
    musicDataPath,
    binaryObjectToBinaryObjectDto(musicData),
  );
};

export const createUploadArtworkDto = (
  artworkImagePath: ArtworkImagePath,
  artworkImage: BinaryObject,
): UploadArtworkImageInputDto => {
  return new UploadArtworkImageInputDto(
    artworkImagePath,
    binaryObjectToBinaryObjectDto(artworkImage),
  );
};
