export interface UploadMusicRequest {
  musicFile: File;
  artworkFile: File;
  title?: string;
  durationSeconds?: number;
}
