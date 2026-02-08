export interface MusicItem {
  id: string;
  title: string;
  durationSeconds: number;
  fileSize: number;
  s3Path: string;
  artworkS3Path?: string | null;
}

export type SubscriptionLike = {
  unsubscribe(): void;
};

export interface UploadMusicRequest {
  musicFile: File;
  artworkFile: File;
  title?: string;
  durationSeconds?: number;
}

export interface MusicRepository {
  listMusic(): Promise<MusicItem[]>;
  observeMusicList(
    next: (items: MusicItem[]) => void,
    error?: (error: unknown) => void,
  ): SubscriptionLike;
  getMusicUrl(s3Path: string): Promise<URL>;
  uploadMusic(request: UploadMusicRequest): Promise<void>;
  removeMusic(music: MusicItem): Promise<void>;
}
