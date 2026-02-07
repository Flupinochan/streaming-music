import css from "@eslint/css";
import json from "@eslint/json";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginOxlint from "eslint-plugin-oxlint";
import pluginVue from "eslint-plugin-vue";
import { globalIgnores } from "eslint/config";

export default defineConfigWithVueTs([
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,ts,mts,tsx}"],
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  ...pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  skipFormatting,

  ...pluginOxlint.configs["flat/recommended"],

  // 関数の戻り値の型定義を必須化
  {
    files: ["**/*.{ts,vue}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },

  // // 不要なVueルールの無効化
  // {
  //   files: ["**/*.vue"],
  //   languageOptions: { parserOptions: { parser: tseslint.parser } },
  //   rules: {
  //     "vue/max-attributes-per-line": "off",
  //     "vue/singleline-html-element-content-newline": "off",
  //   },
  // },

  // json, css設定
  {
    files: ["**/*.json"],
    language: "json/json",
    ...json.configs.recommended,
  },
  {
    files: ["**/*.css"],
    language: "css/css",
    ...css.configs.recommended,
  },
]);
