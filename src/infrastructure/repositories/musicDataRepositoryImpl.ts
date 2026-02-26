import type { ImageBinaryObject } from "@/domain/entities/imageBinaryObject";
import type { MusicBinaryObject } from "@/domain/entities/musicBinaryObject";
import type { MusicDataRepository } from "@/domain/repositories/musicDataRepository";
import type { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import type { ArtworkThumbnailImagePath } from "@/domain/value_objects/artworkThumbnailImagePath";
import type { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type { MusicPath } from "@/domain/value_objects/musicPath";
import type {
  UploadArtworkImageInputDto,
  UploadMusicDataInputDto,
} from "@/infrastructure/repositories/dto/musicDataApiDtos";
import {
  createUploadArtworkDto,
  createUploadMusicDto,
} from "@/infrastructure/repositories/mapper/musicApiMapper";
import { MusicDataRepositoryAmplify } from "./musicDataRepositoryAmplify";

export class MusicDataRepositoryImpl implements MusicDataRepository {
  private readonly repo: MusicDataRepositoryAmplify;

  constructor(repo: MusicDataRepositoryAmplify) {
    this.repo = repo;
  }

  getMusicDataUrl(musicDataPath: MusicPath): Promise<URL> {
    return this.repo.getMusicDataUrl(musicDataPath.toString());
  }

  async uploadMusicData(
    musicDataPath: MusicDataPath,
    musicData: MusicBinaryObject,
  ): Promise<void> {
    const dto: UploadMusicDataInputDto = createUploadMusicDto(
      musicDataPath,
      musicData,
    );
    await this.repo.uploadMusicData(dto);
  }

  async uploadArtworkImage(
    artworkImagePath: ArtworkImagePath,
    artworkImage: ImageBinaryObject,
  ): Promise<void> {
    const dto: UploadArtworkImageInputDto = createUploadArtworkDto(
      artworkImagePath,
      artworkImage,
    );
    await this.repo.uploadArtworkImage(dto);
  }

  async uploadArtworkThumbnailImage(
    artworkThumbnailImagePath: ArtworkThumbnailImagePath,
    artworkThumbnailImage: ImageBinaryObject,
  ): Promise<void> {
    const dto: UploadArtworkImageInputDto = createUploadArtworkDto(
      artworkThumbnailImagePath,
      artworkThumbnailImage,
    );
    await this.repo.uploadArtworkImage(dto);
  }

  async remove(path: MusicPath): Promise<void> {
    await this.repo.remove(path.toString());
  }
}
