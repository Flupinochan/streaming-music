import {
  mdiPause,
  mdiPlay,
  mdiRepeat,
  mdiRepeatOnce,
  mdiShuffleVariant,
  mdiSkipNext,
  mdiSkipPrevious,
} from "@mdi/js";
import type { MusicMetadataSchema } from "amplify/data/resource";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import "vuetify/styles";
import colors from "vuetify/util/colors";
import outputs from "../amplify_outputs.json";
import App from "./App.vue";
import { MusicDataRepositoryAmplify } from "./infrastructure/repositories/musicDataRepositoryAmplify";
import { MusicDataRepositoryImpl } from "./infrastructure/repositories/musicDataRepositoryImpl";
import { MusicMetadataRepositoryAmplify } from "./infrastructure/repositories/musicMetadataRepositoryAmplify";
import { MusicMetadataRepositoryImpl } from "./infrastructure/repositories/musicMetadataRepositoryImpl";
import { useMusicPlayerStore } from "./presentation/stores/useMusicPlayerStore";
import { useMusicStore } from "./presentation/stores/useMusicStore";
import { router } from "./router";
import { CreateMusicUsecase } from "./use_cases/createMusicUsecase";
import { FetchMusicUsecase } from "./use_cases/fetchMusicUsecase";
import { RemoveMusicUsecase } from "./use_cases/removeMusicUsecase";
import { SubMusicMetadataUsecase } from "./use_cases/subMusicMetadataUsecase";

Amplify.configure(outputs);
const client = generateClient<MusicMetadataSchema>();

export type AmplifyMusicMetadataItem =
  Awaited<
    ReturnType<(typeof client)["models"]["MusicMetadata"]["list"]>
  > extends { data: (infer I)[] }
    ? I
    : never;

export type AmplifyMusicMetadataCreateInput = Parameters<
  (typeof client)["models"]["MusicMetadata"]["create"]
>[0];

const pinia = createPinia();

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases: {
      ...aliases,
      mdiPlay,
      mdiSkipNext,
      mdiSkipPrevious,
      mdiPause,
      mdiRepeat,
      mdiRepeatOnce,
      mdiShuffleVariant,
    },
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: "system",
    themes: {
      light: { colors: { primary: colors.blue.base } },
      dark: { colors: { primary: colors.blue.base } },
    },
  },
  defaults: {
    // globalは使用しない
    // global: {},
    VBtn: {
      color: "primary",
    },
    VSlider: {
      color: "primary",
    },
    VListItemTitle: {
      class: "primary",
    },
  },
});

const app = createApp(App).use(pinia).use(vuetify).use(router);

// DI
const musicRepository = new MusicDataRepositoryImpl(
  new MusicDataRepositoryAmplify(),
);
const musicMetadataRepository = new MusicMetadataRepositoryImpl(
  new MusicMetadataRepositoryAmplify(client),
);
const createMusicUsecase = new CreateMusicUsecase(
  musicRepository,
  musicMetadataRepository,
);
const removeMusicUsecase = new RemoveMusicUsecase(
  musicRepository,
  musicMetadataRepository,
);
const subMusicMetadataUsecase = new SubMusicMetadataUsecase(
  musicMetadataRepository,
);
const fetchMusicUsecase = new FetchMusicUsecase(musicRepository);
useMusicStore(pinia).setCreateMusicUsecase(createMusicUsecase);
useMusicStore(pinia).setRemoveMusicUsecase(removeMusicUsecase);
useMusicStore(pinia).setSubMusicMetadataUsecase(subMusicMetadataUsecase);
useMusicPlayerStore(pinia).setFetchMusicUsecase(fetchMusicUsecase);

app.mount("#app");
