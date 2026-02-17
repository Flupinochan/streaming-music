import { MusicPath } from "./musicPath";

/**
 * アートワーク画像のS3上のパスを表す値オブジェクト
 * 例: "music/artwork/12345.jpg"
 */
export class ArtworkImagePath extends MusicPath {
  constructor(artworkImagePath: string) {
    super(artworkImagePath);

    if (!artworkImagePath.startsWith("music/artwork/"))
      throw new Error("Invalid artwork path");
  }

  static createFromFileName(fileName: string): ArtworkImagePath {
    return new ArtworkImagePath(`music/artwork/${fileName}`);
  }

  toString(): string {
    return this.value;
  }
}
