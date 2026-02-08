import type { MusicSchema } from "amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl, remove, uploadData } from "aws-amplify/storage";
import type {
  MusicItem,
  MusicRepository,
  SubscriptionLike,
  UploadMusicRequest,
} from "./musicRepository";

export class AmplifyMusicRepository implements MusicRepository {
  private readonly baseMusicPath = "music";
  private readonly client = generateClient<MusicSchema>();

  private sanitizeFolderName = (name: string): string =>
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^[-.]+|[-.]+$/g, "")
      .slice(0, 80) || "track";

  private baseName = (filename: string): string =>
    filename.replace(/\.[^/.]+$/, "");

  private toRelativePath = (s3Key?: string | null): string | null => {
    if (!s3Key) return null;
    return s3Key.startsWith(`${this.baseMusicPath}/`)
      ? s3Key.replace(`${this.baseMusicPath}/`, "")
      : s3Key;
  };

  private toMusicItem = (m: MusicSchema["Music"]["type"]): MusicItem => {
    return {
      id: m.id,
      title: m.title,
      durationSeconds: m.duration,
      fileSize: m.fileSize,
      s3Path: this.toRelativePath(m.s3MusicKey) ?? "",
      artworkS3Path: this.toRelativePath(m.s3ArtworkKey),
    };
  };

  async listMusic(): Promise<MusicItem[]> {
    const result = await this.client.models.Music.list({
      authMode: "iam",
    });
    if (result.errors?.length) {
      throw new Error(result.errors.map((e) => e.message).join("\n"));
    }

    return (result.data ?? []).map(this.toMusicItem);
  }

  observeMusicList(
    next: (items: MusicItem[]) => void,
    error?: (error: unknown) => void,
  ): SubscriptionLike {
    const subscription = this.client.models.Music.observeQuery({
      authMode: "iam",
    }).subscribe({
      next: ({ items }) => {
        next((items ?? []).map(this.toMusicItem));
      },
      error: (e) => error?.(e),
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }

  async getMusicUrl(s3Path: string): Promise<URL> {
    const linkToStorageFile = await getUrl({
      path: `${this.baseMusicPath}/${s3Path}`,
    });

    return linkToStorageFile.url;
  }

  async uploadMusic(request: UploadMusicRequest): Promise<void> {
    const folder = `${Date.now()}-${this.sanitizeFolderName(request.musicFile.name)}`;

    const musicExt = request.musicFile.name.match(/\.[^/.]+$/)?.[0] ?? "";
    const artworkExt = request.artworkFile.name.match(/\.[^/.]+$/)?.[0] ?? "";

    const musicKey = `${this.baseMusicPath}/audio/${folder}${musicExt}`;
    const artworkKey = `${this.baseMusicPath}/artwork/${folder}${artworkExt}`;

    const title = request.title ?? this.baseName(request.musicFile.name);
    const durationSeconds = request.durationSeconds ?? 0;

    // upload music file to S3
    await uploadData({
      data: request.musicFile,
      path: musicKey,
      options: {
        contentType: request.musicFile.type || "audio/mpeg",
      },
    }).result;

    // upload artwork file to S3
    await uploadData({
      data: request.artworkFile,
      path: artworkKey,
      options: {
        contentType: request.artworkFile.type || "image/jpeg",
      },
    }).result;

    // create a music metadata to DynamoDB
    const createResult = await this.client.models.Music.create({
      title,
      duration: durationSeconds,
      fileSize: request.musicFile.size,
      s3MusicKey: musicKey,
      s3ArtworkKey: artworkKey,
      playCount: 0,
    });

    if (createResult.errors?.length) {
      throw new Error(createResult.errors.map((e) => e.message).join("\n"));
    }
  }

  async removeMusic(music: MusicItem): Promise<void> {
    const deleteResult = await this.client.models.Music.delete({
      id: music.id,
    });
    if (deleteResult.errors?.length) {
      throw new Error(deleteResult.errors.map((e) => e.message).join("\n"));
    }

    await remove({
      path: `${this.baseMusicPath}/${music.s3Path}`,
    }).result;

    if (music.artworkS3Path) {
      await remove({
        path: `${this.baseMusicPath}/${music.artworkS3Path}`,
      }).result;
    }
  }
}
