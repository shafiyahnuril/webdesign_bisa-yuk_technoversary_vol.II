import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

const ban = (names, message) => ({
  paths: names.map((name) => ({ name, message })),
  patterns: names.map((name) => ({ group: [`${name}/*`], message })),
});

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage", "playwright-report", "test-results"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  jsxA11y.flatConfigs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.{js,ts}"],
    languageOptions: { globals: { ...globals.node } },
  },
  // engine: logika murni, tanpa react/three
  {
    files: ["src/engine/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        ban(["react", "react-dom", "three"], "engine/ adalah logika murni (tanpa react/three)."),
      ],
    },
  },
  // stage: boleh three dan engine, tidak boleh react
  {
    files: ["src/stage/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        ban(["react", "react-dom"], "stage/ tidak boleh mengimpor react."),
      ],
    },
  },
  // components: tidak boleh mengimpor stage kecuali StageCanvas (dinamis)
  {
    files: ["src/components/**/*.{ts,tsx}"],
    ignores: ["src/components/story/StageCanvas.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/stage/*", "**/stage/*", "**/stage"],
              message: "Hanya StageCanvas yang boleh memuat stage/ (lewat import() dinamis).",
            },
          ],
        },
      ],
    },
  },
  // content: hanya data
  {
    files: ["src/content/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/components/*", "@/engine/*", "**/components/*", "**/engine/*"],
              message: "content/ hanya data (tanpa impor dari components/ atau engine/).",
            },
          ],
        },
      ],
    },
  },
);
