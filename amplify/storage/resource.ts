import { defineStorage } from "@aws-amplify/backend";

const baseMusicPath = "music";

export const storage = defineStorage({
  name: "musicStorage",
  isDefault: true,
  access: (allow) => ({
    [`${baseMusicPath}/*`]: [
      allow.guest.to(["read"]),
      allow.authenticated.to(["read", "write", "delete"]),
    ],
  }),
});
