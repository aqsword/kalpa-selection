import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const isProjectPage =
  process.env.GITHUB_ACTIONS === "true" &&
  repositoryName &&
  !repositoryName.endsWith(".github.io");

export default defineConfig({
  base: isProjectPage ? `/${repositoryName}/` : "/",
  plugins: [react()],
});

