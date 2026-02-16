import type { MusicMetadata } from "@/domain/entities/musicMetadata";
import type { MusicMetadataRepository } from "@/domain/repositories/musicMetadataRepository";
import { musicMetadataDtoToMusicMetadata } from "@/infrastructure/repositories/mapper/musicMetadataMapper";
import { MusicMetadataRepositoryAmplify } from "@/infrastructure/repositories/musicMetadataRepositoryAmplify";
import { toCreateMusicMetadataRequestDto } from "./mapper/musicMetadataApiMapper";

export class MusicMetadataRepositoryImpl implements MusicMetadataRepository {
  private readonly repo: MusicMetadataRepositoryAmplify;

  constructor(repo: MusicMetadataRepositoryAmplify) {
    this.repo = repo;
  }

  observeMusicMetadata(
    next: (musicMetadata: MusicMetadata[]) => void,
    error?: (err: unknown) => void,
  ): { unsubscribe(): void } {
    return this.repo.observeMusicMetadata(
      (items) => next(items.map(musicMetadataDtoToMusicMetadata)),
      error,
    );
  }

  async listMusicMetadata(): Promise<MusicMetadata[]> {
    const items = await this.repo.listMusicMetadata();
    return items.map(musicMetadataDtoToMusicMetadata);
  }

  async createMusicMetadata(
    musicMetadata: Omit<MusicMetadata, "id">,
  ): Promise<void> {
    const dto = toCreateMusicMetadataRequestDto(musicMetadata);
    await this.repo.createMusicMetadata(dto);
  }

  async removeMusicMetadata(musicMetadata: MusicMetadata): Promise<void> {
    if (!musicMetadata.id) throw new Error("musicMetadata.id is undefined");
    await this.repo.removeMusicMetadata(musicMetadata.id);
  }
}
