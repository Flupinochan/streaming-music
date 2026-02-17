import type { MusicDataRepository } from "@/domain/repositories/musicDataRepository";
import type { FetchMusicDto } from "./fetchMusicDto";
import { fetchMusicDtoToFetchMusicInput } from "./fetchMusicMapper";

export class FetchMusicUsecase {
  constructor(private readonly musicDataRepository: MusicDataRepository) {}

  async fetchMusic(input: FetchMusicDto): Promise<URL> {
    const { musicDataPath } = fetchMusicDtoToFetchMusicInput(input);

    return await this.musicDataRepository.getMusicDataUrl(musicDataPath);
  }
}
