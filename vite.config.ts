import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno()],
  base: '/join-tool',
  publicDir: "/public",
  optimizeDeps: {
    exclude: ["./serverless/**"], // exclude from dependency pre-bundling
  },
  build: {
    rollupOptions: {
      input: "index.html", // your frontend entry point
      external: ["./serverless/**"], // exclude serverless files from build
    },
  },
})
