import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        chromeStorage: resolve(process.cwd(), "src/utils/chromeStorage.ts"),
        popup: resolve(process.cwd(), "src/popup/index.html"),
        content: resolve(process.cwd(), "src/content/index.ts"),
        background: resolve(process.cwd(), "src/background/index.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "src/utils/chromeStorage")
            return "chromeStorage.js";
          if (chunkInfo.name === "src/content/index") return "content.js";
          if (chunkInfo.name === "src/background/index") return "background.js";
          if (chunkInfo.name === "src/popup/index") return "popup.js";
          return "[name].js";
        },
      },
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    target: "chrome90",
    minify: false,
    lib: undefined,
  },
});
