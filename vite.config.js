"use strict";

import { defineConfig } from "vite";
import * as fs from "node:fs/promises";
import path from "path";

const walk = async (dir, filelist = []) => {
  const files = await fs.readdir(dir);

  for (const file of files) {
    if (file[0] !== ".") {
      const filepath = path.join(dir, file);
      if (!filepath.includes("tests")) {
        const stat = await fs.stat(filepath);

        if (stat.isDirectory()) {
          filelist = await walk(filepath, filelist);
        } else {
          filelist.push(filepath);
        }
      }
    }
  }
  return filelist;
};

let inputFileArr = await walk("./components/progress/");

export default defineConfig({
  build: {
    // minify: true,
    outDir: "./dist",
    rollupOptions: {
      input: inputFileArr,
      output: {
        entryFileNames: `[name].js`,
      },
    },
  },
});
