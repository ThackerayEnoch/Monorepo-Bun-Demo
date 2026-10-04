import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite-plus";

import { fmt } from "@qntx/oxfmt";
import { react } from "@qntx/oxlint";

export default defineConfig({
    server: {
    proxy: { '/api': 'http://localhost:3001' },
  },
  lint: react,
  fmt,
  plugins: [tailwindcss()]
});
