import { ImageBinaryObject } from "@/domain/entities/imageBinaryObject";
import { MusicBinaryObject } from "@/domain/entities/musicBinaryObject";
import { MusicMetadata } from "@/domain/entities/musicMetadata";
import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { ArtworkThumbnailImagePath } from "@/domain/value_objects/artworkThumbnailImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type { CreateMusicDto } from "./createMusicDto";

interface CreateMusicInput {
  musicDataPath: MusicDataPath;
  musicData: MusicBinaryObject;
  artworkImagePath: ArtworkImagePath;
  artworkImage: ImageBinaryObject;
  artworkThumbnailImagePath: ArtworkThumbnailImagePath;
  artworkThumbnailImage: ImageBinaryObject;
  musicMetadata: Omit<MusicMetadata, "id">;
}

export const createMusicDtoToCreateMusicInput = async (
  dto: CreateMusicDto,
): Promise<CreateMusicInput> => {
  const musicDataPath = MusicDataPath.createFromFileName(
    dto.musicDataFile.name,
  );

  const artworkImagePath = ArtworkImagePath.createFromFileName(
    dto.artworkImageFile.name,
  );

  const artworkThumbnailImagePath =
    ArtworkThumbnailImagePath.createFromFileName(dto.artworkImageFile.name);
  const arrayBuffer = await dto.artworkThumbnailImageBlob.arrayBuffer();

  const [musicData, artworkImage, artworkThumbnailImage] = await Promise.all([
    MusicBinaryObject.fromFile(dto.musicDataFile),
    ImageBinaryObject.fromFile(dto.artworkImageFile),
    ImageBinaryObject.create(
      arrayBuffer,
      dto.artworkImageFile.type,
      dto.artworkImageFile.name,
    ),
  ]);

  const musicMetadata = MusicMetadata.create(
    musicData.musicTitle,
    dto.musicDurationSeconds,
    musicData.size,
    musicDataPath,
    artworkImagePath,
    artworkThumbnailImagePath,
  );

  return {
    musicDataPath,
    musicData,
    artworkImagePath,
    artworkImage,
    artworkThumbnailImagePath,
    artworkThumbnailImage,
    musicMetadata,
  };
};
