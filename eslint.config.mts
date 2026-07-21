import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
  globalIgnores([
    'node_modules',
    'main.js',
    'esbuild.config.mjs',
    'eslint.config.mts',
    'scripts',
    'tests',
    'vitest.config.ts',
  ]),
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        projectService: {
          allowDefaultProject: ['manifest.json'],
        },
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.json'],
      },
    },
  },
  ...obsidianmd.configs.recommended,
  {
    rules: {
      // Obsidian 1.12 on the iPad still needs the imperative settings API.
      'obsidianmd/settings-tab/prefer-setting-definitions': 'off',
    },
  },
);
