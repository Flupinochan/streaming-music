import { MusicPath } from "./musicPath";

/**
 * 音楽データのS3上のパスを表す値オブジェクト
 * 例: "music/audio/12345.mp3"
 */
export class MusicDataPath extends MusicPath {
  constructor(musicDataPath: string) {
    super(musicDataPath);

    if (!musicDataPath.startsWith("music/audio/"))
      throw new Error("Invalid audio path");
  }

  static createFromFileName(fileName: string): MusicDataPath {
    return new MusicDataPath(`music/audio/${fileName}`);
  }
}
