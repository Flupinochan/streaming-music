import { MusicMetadataDto } from "@/infrastructure/dto/musicMetadataDto";
import {
  amplifyModelToMusicMetadataDto,
  musicMetadataDtoToCreateAmplifyModel,
} from "@/infrastructure/mappers/musicMetadataMapper";
import { client } from "@/infrastructure/repositories/amplifyClient";

export class MusicMetadataRepositoryAmplify {
  observeMusicMetadata(
    next: (items: MusicMetadataDto[]) => void,
    error?: (err: unknown) => void,
  ): { unsubscribe(): void } {
    const subscription = client.models.MusicMetadata.observeQuery({
      authMode: "iam",
    }).subscribe({
      next: ({ items }) => {
        next((items ?? []).map((it) => amplifyModelToMusicMetadataDto(it)));
      },
      error: (e) => error?.(e),
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }

  async listMusicMetadata(): Promise<MusicMetadataDto[]> {
    const { data, errors } = await client.models.MusicMetadata.list();
    return data.map((it) => amplifyModelToMusicMetadataDto(it));
  }

  async createMusicMetadata(dto: MusicMetadataDto): Promise<void> {
    const createAmplifyModel = musicMetadataDtoToCreateAmplifyModel(dto);
    await client.models.MusicMetadata.create(createAmplifyModel);
  }

  async removeMusicMetadata(id: string): Promise<void> {
    await client.models.MusicMetadata.delete({ id });
  }
}
