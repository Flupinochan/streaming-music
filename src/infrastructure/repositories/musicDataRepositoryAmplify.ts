import type {
  UploadArtworkImageInputDto,
  UploadMusicDataInputDto,
} from "@/infrastructure/repositories/dto/musicDataApiDtos";
import { getUrl, remove, uploadData } from "aws-amplify/storage";

export class MusicDataRepositoryAmplify {
  async getMusicDataUrl(musicDataPath: string): Promise<URL> {
    const link = await getUrl({ path: musicDataPath });
    return link.url;
  }

  async uploadMusicData(input: UploadMusicDataInputDto): Promise<void> {
    const blob = new Blob([input.musicData.data], {
      type: input.musicData.contentType,
    });

    // 同一ファイル名の場合はキャッシュされているため注意
    // データ更新時は必ず別ファイル名にすること
    // 日付をつけるなどして、同じファイル名で上書きしないようにすること
    await uploadData({
      data: blob,
      path: input.musicDataPath,
      options: {
        contentType: input.musicData.contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    }).result;
  }

  async uploadArtworkImage(input: UploadArtworkImageInputDto): Promise<void> {
    const blob = new Blob([input.artworkImage.data], {
      type: input.artworkImage.contentType,
    });

    await uploadData({
      data: blob,
      path: input.artworkImagePath,
      options: {
        contentType: input.artworkImage.contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    }).result;
  }

  async remove(path: string): Promise<void> {
    await remove({ path });
  }
}
