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
import { router } from "./router";

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

createApp(App).use(pinia).use(vuetify).use(router).mount("#app");
