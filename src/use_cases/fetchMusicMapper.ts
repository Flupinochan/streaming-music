import { MusicPath } from "@/domain/value_objects/musicPath";
import { FetchMusicDto } from "./fetchMusicDto";

interface FetchMusicInput {
  musicDataPath: MusicPath;
}

export const fetchMusicDtoToFetchMusicInput = (
  dto: FetchMusicDto,
): FetchMusicInput => {
  const musicDataPath = new MusicPath(dto.musicDataPath);

  return {
    musicDataPath,
  };
};
