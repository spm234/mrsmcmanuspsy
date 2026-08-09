import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" makes the build use relative asset paths, so it works whether
// it's served at the root of a domain or under a GitHub Pages project path
// like username.github.io/repo-name/ — no need to hardcode the repo name.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
