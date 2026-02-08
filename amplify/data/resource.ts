import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const musicSchema = a.schema({
  Music: a
    .model({
      title: a.string().required(),
      duration: a.integer().required(),
      fileSize: a.integer().required(),
      s3MusicKey: a.string().required(),
      s3ArtworkKey: a.string(),
      playCount: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.guest().to(["read"]),
      allow.authenticated(),
    ]),
});

export type MusicSchema = ClientSchema<typeof musicSchema>;

export const data = defineData({
  schema: musicSchema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
