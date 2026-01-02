import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/config/index.ts"],
  minify: true,
  dts: true,
});
