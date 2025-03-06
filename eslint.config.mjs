import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config} */
const config = [
  { ignores: ["**/dist/"] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
];
export default config;
