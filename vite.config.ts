import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite"
import path from "path"

export default defineConfig({
  plugins: [react(), cloudflare(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@types': path.resolve(__dirname, './src/types'),
      "@components": path.resolve(__dirname, "./src/react-app/components"),
      "@lib": path.resolve(__dirname, "./src/react-app/lib"),
      "@pages": path.resolve(__dirname, "./src/react-app/pages"),
      "@hooks": path.resolve(__dirname, "./src/react-app/hooks"),
      "@services": path.resolve(__dirname, "./src/react-app/services"),
    },
  },
  // Proxy /api requests to the Cloudflare Worker dev server
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
});
