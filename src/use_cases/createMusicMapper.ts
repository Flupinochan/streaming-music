import { ImageBinaryObject } from "@/domain/entities/imageBinaryObject";
import { MusicBinaryObject } from "@/domain/entities/musicBinaryObject";
import { MusicMetadata } from "@/domain/entities/musicMetadata";
import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type { CreateMusicDto } from "./createMusicDto";

interface CreateMusicInput {
  musicDataPath: MusicDataPath;
  musicData: MusicBinaryObject;
  artworkImagePath: ArtworkImagePath;
  artworkImage: ImageBinaryObject;
  musicMetadata: Omit<MusicMetadata, "id">;
}

export const createMusicInputToMusicMetadata = async (
  dto: CreateMusicDto,
): Promise<CreateMusicInput> => {
  const musicDataPath = MusicDataPath.createFromFileName(
    dto.musicDataFile.name,
  );

  const artworkImagePath = ArtworkImagePath.createFromFileName(
    dto.artworkImageFile.name,
  );

  const [musicData, artworkImage] = await Promise.all([
    MusicBinaryObject.fromFile(dto.musicDataFile),
    ImageBinaryObject.fromFile(dto.artworkImageFile),
  ]);

  const musicMetadata = new MusicMetadata(
    undefined,
    musicData.musicTitle,
    dto.musicDurationSeconds,
    musicData.size,
    musicDataPath,
    artworkImagePath,
  );

  return {
    musicDataPath,
    musicData,
    artworkImagePath,
    artworkImage,
    musicMetadata,
  };
};
