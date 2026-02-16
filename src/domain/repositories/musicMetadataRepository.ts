import type { MusicMetadata } from "../entities/musicMetadata";

export interface MusicMetadataRepository {
  observeMusicMetadata(
    next: (musicMetadata: MusicMetadata[]) => void,
    error?: (error: unknown) => void,
  ): { unsubscribe(): void };
  listMusicMetadata(): Promise<MusicMetadata[]>;
  createMusicMetadata(musicMetadata: Omit<MusicMetadata, "id">): Promise<void>;
  removeMusicMetadata(musicMetadata: MusicMetadata): Promise<void>;
}
