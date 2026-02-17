import type {
  Observable,
  Observer,
  Subscription,
} from "@/domain/repositories/observable";
import { client } from "@/infrastructure/repositories/amplifyClient";
import { MusicMetadataDto } from "@/infrastructure/repositories/dto/musicMetadataDto";
import {
  amplifyModelToMusicMetadataDto,
  musicMetadataDtoToCreateAmplifyModel,
} from "@/infrastructure/repositories/mapper/musicMetadataMapper";

export class MusicMetadataRepositoryAmplify {
  observeMusicMetadata(): Observable<MusicMetadataDto[]> {
    return {
      subscribe(observer: Observer<MusicMetadataDto[]>): Subscription {
        const amplifySub = client.models.MusicMetadata.observeQuery({
          authMode: "iam",
        }).subscribe({
          next: ({ items }) => {
            const dtos = items.map((item) =>
              amplifyModelToMusicMetadataDto(item),
            );
            observer.next(dtos);
          },
          error: (e) => observer.error?.(e),
        });

        return {
          unsubscribe: (): void => amplifySub.unsubscribe(),
        };
      },
    };
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
