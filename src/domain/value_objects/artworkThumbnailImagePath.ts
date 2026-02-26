import { MusicPath } from "./musicPath";

/**
 * アートワークサムネイル画像のS3上のパスを表す値オブジェクト
 * 例: "music/thumbnail/12345-thumbnail.jpg"
 */
export class ArtworkThumbnailImagePath extends MusicPath {
  constructor(artworkThumbnailImagePath: string) {
    super(artworkThumbnailImagePath);

    if (!artworkThumbnailImagePath.startsWith("music/thumbnail/"))
      throw new Error("Invalid artwork thumbnail path");
  }

  static createFromFileName(fileName: string): ArtworkThumbnailImagePath {
    return new ArtworkThumbnailImagePath(`music/thumbnail/${fileName}`);
  }

  toString(): string {
    return this.value;
  }
}
