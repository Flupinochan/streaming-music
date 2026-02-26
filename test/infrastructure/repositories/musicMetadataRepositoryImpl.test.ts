/// <reference types="node" />
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { MusicMetadata } from "@/domain/entities/musicMetadata";
import type { MusicMetadataRepository } from "@/domain/repositories/musicMetadataRepository";
import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { ArtworkThumbnailImagePath } from "@/domain/value_objects/artworkThumbnailImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type { TrackId } from "@/domain/value_objects/trackId";
import { MusicMetadataRepositoryAmplify } from "@/infrastructure/repositories/musicMetadataRepositoryAmplify";
import { MusicMetadataRepositoryImpl } from "@/infrastructure/repositories/musicMetadataRepositoryImpl";
import type { MusicMetadataSchema } from "amplify/data/resource";
import { Amplify } from "aws-amplify";
import { signIn, signOut } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import outputs from "../../../amplify_outputs.json";

describe("MusicMetadataRepository integration", () => {
  let repo: MusicMetadataRepository;
  const createdIds: TrackId[] = [];

  beforeAll(async () => {
    // Amplify認証
    Amplify.configure(outputs);
    const client = generateClient<MusicMetadataSchema>();

    const TEST_EMAIL = process.env.TEST_EMAIL;
    const TEST_PASSWORD = process.env.TEST_PASSWORD;

    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error(
        "TEST_EMAIL and TEST_PASSWORD must be set in environment",
      );
    }

    await signOut().catch(() => {});
    await signIn({ username: TEST_EMAIL, password: TEST_PASSWORD });

    repo = new MusicMetadataRepositoryImpl(
      new MusicMetadataRepositoryAmplify(client),
    );
  });

  afterAll(async () => {
    for (const id of createdIds) {
      await repo.removeMusicMetadata(id).catch(() => {});
    }

    await signOut().catch(() => {});
  });

  const makeMetadata = (prefix: string): MusicMetadata => {
    const musicFileName = `${prefix}-${Date.now()}.mp3`;
    const artworkFileName = `${prefix}-${Date.now()}.png`;

    const musicPath = MusicDataPath.createFromFileName(musicFileName);
    const artworkPath = ArtworkImagePath.createFromFileName(artworkFileName);
    const artworkThumbnailImagePath =
      ArtworkThumbnailImagePath.createFromFileName(artworkFileName);

    return MusicMetadata.create(
      prefix,
      123,
      1024 * 50,
      musicPath,
      artworkPath,
      artworkThumbnailImagePath,
    );
  };

  it("createMusicMetadata and listMusicMetadata", async () => {
    const metadata = makeMetadata("create-and-list");
    await repo.createMusicMetadata(metadata);
    createdIds.push(metadata.id);

    const items = await repo.listMusicMetadata();
    const found = items.some(
      (item) => item.id.toString() === metadata.id.toString(),
    );
    expect(found).toBe(true);
  });

  it("removeMusicMetadata", async () => {
    const metadata = makeMetadata("remove");

    await repo.createMusicMetadata(metadata);
    const items = await repo.listMusicMetadata();
    expect(
      items.some((item) => item.id.toString() === metadata.id.toString()),
    ).toBe(true);

    await repo.removeMusicMetadata(metadata.id);
    const after = await repo.listMusicMetadata();
    expect(
      after.some((item) => item.id.toString() === metadata.id.toString()),
    ).toBe(false);
  });

  // observeMusicMetadata (subscription) のテストは安定しないためE2Eテストで行う
});
