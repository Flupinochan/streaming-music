import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import { RemoveMusicDto } from "./removeMusicDto";

interface RemoveMusicInput {
  id: string;
  musicDataPath: MusicDataPath;
  artworkImagePath: ArtworkImagePath;
}

export const removeMusicDtoToRemoveMusicInput = (
  dto: RemoveMusicDto,
): RemoveMusicInput => {
  const musicDataPath = new MusicDataPath(dto.musicDataPath);
  const artworkImagePath = new ArtworkImagePath(dto.artworkImagePath);

  return {
    id: dto.id,
    musicDataPath,
    artworkImagePath,
  };
};
