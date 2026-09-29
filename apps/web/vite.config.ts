import { defineConfig } from "vite-plus";

import { fmt } from "@qntx/oxfmt";
import { react } from "@qntx/oxlint";

export default defineConfig({
  lint: react,
  fmt,
});
