import type { MusicMetadata } from "../entities/musicMetadata";
import type { TrackId } from "../value_objects/trackId";
import type { Observable } from "./observable";

export interface MusicMetadataRepository {
  observeMusicMetadata(): Observable<MusicMetadata[]>;
  listMusicMetadata(): Promise<MusicMetadata[]>;
  createMusicMetadata(musicMetadata: Omit<MusicMetadata, "id">): Promise<void>;
  removeMusicMetadata(id: TrackId): Promise<void>;
}
