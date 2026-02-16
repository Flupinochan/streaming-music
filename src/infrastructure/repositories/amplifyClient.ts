import type { MusicMetadataSchema } from "amplify/data/resource";
import { generateClient } from "aws-amplify/data";

export const client = generateClient<MusicMetadataSchema>();

export type AmplifyMusicMetadataItem =
  Awaited<
    ReturnType<(typeof client)["models"]["MusicMetadata"]["list"]>
  > extends { data: (infer I)[] }
    ? I
    : never;

export type AmplifyMusicMetadataCreateInput = Parameters<
  (typeof client)["models"]["MusicMetadata"]["create"]
>[0];
