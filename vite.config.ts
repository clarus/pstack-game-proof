import { defineConfig } from "vite";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
export default defineConfig(({ mode }) => {
  const profile = ["chapter", "preview", "embed-test"].includes(mode)
    ? mode
    : "chapter";
  const limit = profile === "embed-test" ? 1 : profile === "preview" ? 6 : 7;
  return {
    base: process.env.BASE_PATH || "./",
    define: { __PROFILE__: JSON.stringify(profile) },
    plugins: [
      {
        name: "verified-level-profile",
        resolveId(id) {
          if (id === "virtual:levels") return "\0virtual:levels";
        },
        load(id) {
          if (id === "\0virtual:levels") {
            this.addWatchFile(resolve("src/content/dungeon.json"));
            const levels = JSON.parse(
              readFileSync("src/content/dungeon.json", "utf8"),
            ).slice(0, limit);
            if (profile === "chapter") {
              this.addWatchFile(resolve("src/content/workshop.json"));
              levels.push(
                ...JSON.parse(
                  readFileSync("src/content/workshop.json", "utf8"),
                ),
              );
            }
            return `export default ${JSON.stringify(levels)}`;
          }
        },
        handleHotUpdate(ctx) {
          if (/\/src\/content\/(dungeon|workshop)\.json$/.test(ctx.file)) {
            const mod =
              ctx.server.moduleGraph.getModuleById("\0virtual:levels");
            if (mod) {
              ctx.server.moduleGraph.invalidateModule(mod);
              return [mod];
            }
          }
        },
      },
    ],
    build: {
      outDir: `dist/${profile}`,
      emptyOutDir: true,
      rollupOptions: { input: { index: "index.html", embed: "embed.html" } },
    },
    server: {
      host: "127.0.0.1",
      watch: {
        ignored: ["**/dist/**", "**/artifacts/**", "**/test-results/**"],
      },
    },
  };
});
