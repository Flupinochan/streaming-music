/// <reference types="node" />

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ImageBinaryObject } from "@/domain/entities/imageBinaryObject";
import { MusicBinaryObject } from "@/domain/entities/musicBinaryObject";
import type { MusicDataRepository } from "@/domain/repositories/musicDataRepository";
import { ArtworkImagePath } from "@/domain/value_objects/artworkImagePath";
import { MusicDataPath } from "@/domain/value_objects/musicDataPath";
import type { MusicPath } from "@/domain/value_objects/musicPath";
import { MusicDataRepositoryAmplify } from "@/infrastructure/repositories/musicDataRepositoryAmplify";
import { MusicDataRepositoryImpl } from "@/infrastructure/repositories/musicDataRepositoryImpl";
import { Amplify } from "aws-amplify";
import { signIn, signOut } from "aws-amplify/auth";
import outputs from "../../../amplify_outputs.json";
import { mp3Fixture, pngFixture } from "../../fixtures/mediaFixtures";

describe("MusicDataRepository integration", () => {
  let repo: MusicDataRepository;
  let mp3: ReturnType<typeof mp3Fixture>;
  let png: ReturnType<typeof pngFixture>;
  const createdPaths: MusicPath[] = [];

  beforeAll(async () => {
    // Amplify認証
    Amplify.configure(outputs);

    const TEST_EMAIL = process.env.TEST_EMAIL;
    const TEST_PASSWORD = process.env.TEST_PASSWORD;

    if (!TEST_EMAIL || !TEST_PASSWORD) {
      throw new Error(
        "TEST_EMAIL and TEST_PASSWORD must be set in environment",
      );
    }

    await signOut().catch(() => {});
    await signIn({ username: TEST_EMAIL, password: TEST_PASSWORD });

    // 音楽ファイルと画像ファイルを準備
    mp3 = mp3Fixture();
    png = pngFixture();

    repo = new MusicDataRepositoryImpl(new MusicDataRepositoryAmplify());
  });

  afterAll(async () => {
    // cleanup uploaded files from other tests
    for (const p of createdPaths) {
      await repo.remove(p).catch(() => {});
    }

    await signOut().catch(() => {});
  });

  const makeMusicArgs = (
    prefix: string,
  ): { path: MusicDataPath; music: MusicBinaryObject } => {
    const fileName = `${prefix}-${Date.now()}.mp3`;
    const path = MusicDataPath.createFromFileName(fileName);
    const buffer = mp3.data.buffer.slice(
      mp3.data.byteOffset,
      mp3.data.byteOffset + mp3.data.byteLength,
    );
    const music = MusicBinaryObject.create(
      buffer as ArrayBuffer,
      mp3.contentType,
      fileName,
    );
    return { path, music } as const;
  };

  const makeArtworkArgs = (
    prefix: string,
  ): { path: ArtworkImagePath; image: ImageBinaryObject } => {
    const fileName = `${prefix}-${Date.now()}.png`;
    const path = ArtworkImagePath.createFromFileName(fileName);
    const buffer = png.data.buffer.slice(
      png.data.byteOffset,
      png.data.byteOffset + png.data.byteLength,
    );
    const image = ImageBinaryObject.create(
      buffer as ArrayBuffer,
      png.contentType,
      fileName,
    );
    return { path, image } as const;
  };

  it("uploadMusicData", async () => {
    const { path, music } = makeMusicArgs("music");
    await repo.uploadMusicData(path, music);
    createdPaths.push(path);
  });

  it("getMusicDataUrl", async () => {
    const { path, music } = makeMusicArgs("getUrl");
    await repo.uploadMusicData(path, music);
    createdPaths.push(path);
    const url = await repo.getMusicDataUrl(path);
    const isUrl = url instanceof URL;
    expect(isUrl).toBe(true);
  });

  it("uploadArtworkImage", async () => {
    const { path, image } = makeArtworkArgs("artwork");
    await repo.uploadArtworkImage(path, image);
    createdPaths.push(path);
  });

  it("remove", async () => {
    const { path: musicPath, music } = makeMusicArgs("remove-music");
    await repo.uploadMusicData(musicPath, music);
    await repo.remove(musicPath);

    const { path: artworkPath, image } = makeArtworkArgs("remove-artwork");
    await repo.uploadArtworkImage(artworkPath, image);
    await repo.remove(artworkPath);
  });
});
