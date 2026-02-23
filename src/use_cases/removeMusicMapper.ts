import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import { TrackId } from "@/domain/value_objects/trackId";
import { RemoveMusicDto } from "./removeMusicDto";

interface RemoveMusicInput {
  id: TrackId;
  musicDataPath: MusicDataPath;
  artworkImagePath: ArtworkImagePath;
}

export const removeMusicDtoToRemoveMusicInput = (
  dto: RemoveMusicDto,
): RemoveMusicInput => {
  const musicDataPath = new MusicDataPath(dto.musicDataPath);
  const artworkImagePath = new ArtworkImagePath(dto.artworkImagePath);
  const trackId = TrackId.create(dto.id);

  return {
    id: trackId,
    musicDataPath,
    artworkImagePath,
  };
};
