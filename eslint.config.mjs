import globals from "globals";

import path from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({baseDirectory: __dirname, recommendedConfig: pluginJs.configs.recommended});

export default [
  {languageOptions: { globals: globals.node }},
  { files: ['src/**/*.ts'] },
  ...compat.extends("standard-with-typescript"),
  ...compat.extends('plugin:prettier/recommended'),
  {
    rules: {
      "no-useless-return": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/array-type": "off"
    }
  }
];