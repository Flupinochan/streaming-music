import type { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import type { MusicPath } from "@/domain/value_objects/musicPath";
import { BinaryObjectDto } from "./binaryObjectDto";

export class UploadMusicDataInputDto {
  public readonly musicDataPath: string;
  public readonly musicData: BinaryObjectDto;

  constructor(musicDataPath: MusicPath, musicData: BinaryObjectDto) {
    this.musicDataPath = musicDataPath.toString();
    this.musicData = musicData;
  }
}

export class UploadArtworkImageInputDto {
  public readonly artworkImagePath: string;
  public readonly artworkImage: BinaryObjectDto;

  constructor(
    artworkImagePath: ArtworkImagePath,
    artworkImage: BinaryObjectDto,
  ) {
    this.artworkImagePath = artworkImagePath.toString();
    this.artworkImage = artworkImage;
  }
}
