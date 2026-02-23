import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const musicMetadataSchema = a.schema({
  MusicMetadata: a
    .model({
      title: a.string().required(),
      musicDurationSeconds: a.integer().required(),
      musicDataBytes: a.integer().required(),
      musicDataPath: a.string().required(),
      artworkImagePath: a.string().required(),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated("identityPool"),
    ]),
});

export type MusicMetadataSchema = ClientSchema<typeof musicMetadataSchema>;

export const data = defineData({
  schema: musicMetadataSchema,
  authorizationModes: {
    defaultAuthorizationMode: "identityPool",
  },
});
