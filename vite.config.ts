import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno()],
  base: '/join-tool',
  build: {
    target: "esnext",
    rollupOptions: {
      external: ["node:process"], // optional: skips bundling
    },
  },
  resolve: {
    alias: {
      "node:process": "process/browser",
    },
  },
})
