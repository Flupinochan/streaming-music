import { mdiFileImage } from "@mdi/js";
import { Amplify } from "aws-amplify";
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
import { createHowlerMusicPlayer } from "./infrastructure/gateways/howlerMusicPlayerFactory";
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

const pinia = createPinia();

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: "mdi",
    aliases: {
      ...aliases,
      fileImage: mdiFileImage,
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
    global: {
      color: "primary",
      variant: "outlined",
    },
  },
});

const app = createApp(App).use(pinia).use(vuetify).use(router);

// DI
const musicRepository = new MusicDataRepositoryImpl(
  new MusicDataRepositoryAmplify(),
);
const musicMetadataRepository = new MusicMetadataRepositoryImpl(
  new MusicMetadataRepositoryAmplify(),
);
const fetchMusicUsecase = new FetchMusicUsecase(musicRepository);
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
useMusicStore(pinia).setFetchMusicUsecase(fetchMusicUsecase);
useMusicStore(pinia).setCreateMusicUsecase(createMusicUsecase);
useMusicStore(pinia).setRemoveMusicUsecase(removeMusicUsecase);
useMusicStore(pinia).setSubMusicMetadataUsecase(subMusicMetadataUsecase);
useMusicPlayerStore(pinia).setMusicPlayerFactory(createHowlerMusicPlayer);

app.mount("#app");
