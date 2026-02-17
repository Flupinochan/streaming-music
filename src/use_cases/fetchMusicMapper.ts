import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import { FetchMusicDto } from "./fetchMusicDto";

interface FetchMusicInput {
  musicDataPath: MusicDataPath;
}

export const fetchMusicDtoToFetchMusicInput = (
  dto: FetchMusicDto,
): FetchMusicInput => {
  const musicDataPath = new MusicDataPath(dto.musicDataPath);

  return {
    musicDataPath,
  };
};
