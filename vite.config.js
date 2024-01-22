"use strict";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: true,
    outDir: "./dist",
    rollupOptions: {
      input: ['components/progress/progress-circle/init-circle.js','components/progress/progress-steps/init-steps.js','components/progress/progress-bar/init-bar.js','components/progress/globals/classes/progress.js','components/progress/progress-bar/modules/classes/progress-bar.js', 'components/progress/progress-steps/modules/classes/progress-steps.js', 'components/progress/progress-circle/modules/classes/progress-circle.js'],
      output: {
        entryFileNames: `[name].js`,
      },
    },
  },
});
