import type { BinaryObjectDto } from "@/presentation/dto/binaryObjectDto";

export interface MusicUploadDto {
  musicAudio: BinaryObjectDto;
  artworkImage: BinaryObjectDto;
  title: string;
  durationSeconds: number;
}
