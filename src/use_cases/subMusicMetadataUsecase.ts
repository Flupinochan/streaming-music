import type { MusicMetadataRepository } from "@/domain/repositories/musicMetadataRepository";
import type {
  Observable,
  Observer,
  Subscription,
} from "@/domain/repositories/observable";
import type { SubMusicMetadataDto } from "./subMusicMetadataDto";
import { musicMetadataToSubMusicMetadataDto } from "./subMusicMetadataMapper";

export class SubMusicMetadataUsecase {
  constructor(
    private readonly musicMetadataRepository: MusicMetadataRepository,
  ) {}

  observeMusicMetadata(): Observable<SubMusicMetadataDto[]> {
    const source = this.musicMetadataRepository.observeMusicMetadata();

    return {
      subscribe(observer: Observer<SubMusicMetadataDto[]>): Subscription {
        const sub = source.subscribe({
          next: (entities) => {
            const dtos = entities.map(musicMetadataToSubMusicMetadataDto);
            observer.next(dtos);
          },
          error: (e) => observer.error?.(e),
        });

        return {
          unsubscribe: (): void => sub.unsubscribe(),
        };
      },
    };
  }
}
