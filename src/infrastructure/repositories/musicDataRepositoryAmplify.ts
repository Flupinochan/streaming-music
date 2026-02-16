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

    await uploadData({
      data: blob,
      path: input.musicDataPath,
      options: { contentType: input.musicData.contentType },
    }).result;
  }

  async uploadArtworkImage(input: UploadArtworkImageInputDto): Promise<void> {
    const blob = new Blob([input.artworkImage.data], {
      type: input.artworkImage.contentType,
    });

    await uploadData({
      data: blob,
      path: input.artworkImagePath,
      options: { contentType: input.artworkImage.contentType },
    }).result;
  }

  async remove(path: string): Promise<void> {
    await remove({ path });
  }
}
