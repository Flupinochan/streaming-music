import type { MusicMetadata } from "../entities/musicMetadata";
import type { Observable } from "./observable";

export interface MusicMetadataRepository {
  observeMusicMetadata(): Observable<MusicMetadata[]>;
  listMusicMetadata(): Promise<MusicMetadata[]>;
  createMusicMetadata(musicMetadata: Omit<MusicMetadata, "id">): Promise<void>;
  removeMusicMetadata(id: string): Promise<void>;
}
