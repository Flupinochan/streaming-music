import type { MusicDataRepository } from "@/domain/repositories/musicDataRepository";
import type { MusicMetadataRepository } from "@/domain/repositories/musicMetadataRepository";
import type { CreateMusicDto } from "@/use_cases/createMusicDto";
import { createMusicInputToMusicMetadata } from "./createMusicMapper";

export class CreateMusicUsecase {
  private readonly musicDataRepository: MusicDataRepository;
  private readonly musicMetadataRepository: MusicMetadataRepository;

  constructor(
    musicDataRepository: MusicDataRepository,
    musicMetadataRepository: MusicMetadataRepository,
  ) {
    this.musicDataRepository = musicDataRepository;
    this.musicMetadataRepository = musicMetadataRepository;
  }

  async uploadMusic(input: CreateMusicDto): Promise<void> {
    const {
      musicDataPath,
      musicData,
      artworkImagePath,
      artworkImage,
      musicMetadata,
    } = await createMusicInputToMusicMetadata(input);

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
