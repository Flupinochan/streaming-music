import type { ImageBinaryObject } from "../entities/imageBinaryObject";
import type { MusicBinaryObject } from "../entities/musicBinaryObject";
import type { ArtworkImagePath } from "../value_objects/artworkImagePath";
import type { ArtworkThumbnailImagePath } from "../value_objects/artworkThumbnailImagePath";
import type { MusicDataPath } from "../value_objects/musicDataPath";
import type { MusicPath } from "../value_objects/musicPath";

export interface MusicDataRepository {
  getMusicDataUrl(musicDataPath: MusicPath): Promise<URL>;
  uploadMusicData(
    musicDataPath: MusicDataPath,
    musicData: MusicBinaryObject,
  ): Promise<void>;
  // getArtworkImageUrl(artworkImagePath: ArtworkImagePath): Promise<URL>;
  uploadArtworkImage(
    artworkImagePath: ArtworkImagePath,
    artworkImage: ImageBinaryObject,
  ): Promise<void>;
  uploadArtworkThumbnailImage(
    artworkThumbnailImagePath: ArtworkThumbnailImagePath,
    artworkThumbnailImage: ImageBinaryObject,
  ): Promise<void>;
  remove(path: MusicPath): Promise<void>;
}
