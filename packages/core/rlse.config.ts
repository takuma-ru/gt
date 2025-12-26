import { defineConfig } from "@takuma-ru/rlse";

export default defineConfig({
  name: "git-turbo",
  buildCmd: "pnpm build",
  gitUserName: "github-actions[bot]",
  gitUserEmail: "41898282+github-actions[bot]@users.noreply.github.com",
});
