import type { MusicDataRepository } from "@/domain/repositories/musicDataRepository";
import type { MusicMetadataRepository } from "@/domain/repositories/musicMetadataRepository";
import type { CreateMusicDto } from "@/use_cases/createMusicDto";
import { createMusicDtoToCreateMusicInput } from "./createMusicMapper";

export class CreateMusicUsecase {
  constructor(
    private readonly musicDataRepository: MusicDataRepository,
    private readonly musicMetadataRepository: MusicMetadataRepository,
  ) {}

  async uploadMusic(input: CreateMusicDto): Promise<void> {
    const {
      musicDataPath,
      musicData,
      artworkImagePath,
      artworkImage,
      musicMetadata,
    } = await createMusicDtoToCreateMusicInput(input);

    await Promise.all([
      this.musicDataRepository.uploadMusicData(musicDataPath, musicData),
      this.musicDataRepository.uploadArtworkImage(
        artworkImagePath,
        artworkImage,
      ),
      this.musicMetadataRepository.createMusicMetadata(musicMetadata),
    ]);
  }
}
