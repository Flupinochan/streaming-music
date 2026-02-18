import type {
  Observable,
  Observer,
  Subscription,
} from "@/domain/repositories/observable";
import { MusicMetadataDto } from "@/infrastructure/repositories/dto/musicMetadataDto";
import {
  amplifyModelToMusicMetadataDto,
  musicMetadataDtoToCreateAmplifyModel,
} from "@/infrastructure/repositories/mapper/musicMetadataMapper";
import type { MusicMetadataSchema } from "amplify/data/resource";
import type { V6Client } from "node_modules/@aws-amplify/api-graphql/dist/esm/types";

export class MusicMetadataRepositoryAmplify {
  constructor(private readonly client: V6Client<MusicMetadataSchema>) {}

  observeMusicMetadata(): Observable<MusicMetadataDto[]> {
    return {
      subscribe: (observer: Observer<MusicMetadataDto[]>): Subscription => {
        // authModeはSchema定義と同じようにuserPoolを指定
        const amplifySub = this.client.models.MusicMetadata.observeQuery({
          authMode: "userPool",
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
          unsubscribe: () => amplifySub.unsubscribe(),
        };
      },
    };
  }

  async listMusicMetadata(): Promise<MusicMetadataDto[]> {
    const { data, errors } = await this.client.models.MusicMetadata.list();
    return data.map((item) => amplifyModelToMusicMetadataDto(item));
  }

  async createMusicMetadata(dto: MusicMetadataDto): Promise<void> {
    const createAmplifyModel = musicMetadataDtoToCreateAmplifyModel(dto);
    await this.client.models.MusicMetadata.create(createAmplifyModel);
  }

  async removeMusicMetadata(id: string): Promise<void> {
    await this.client.models.MusicMetadata.delete({ id });
  }
}
