export class CreateMusicDto {
  public readonly musicDataFile: File;
  public readonly artworkImageFile: File;
  // 音楽再生時間はTypeScript組み込み機能では取得できないため、フロントエンドで計算して渡す
  public readonly musicDurationSeconds: number;

  constructor(
    musicDataFile: File,
    artworkImageFile: File,
    musicDurationSeconds: number,
  ) {
    this.musicDataFile = musicDataFile;
    this.artworkImageFile = artworkImageFile;
    this.musicDurationSeconds = musicDurationSeconds;
  }
}
