import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "Lesp resources",
        short_name: "Lesp",
        description: "Lesp resources PWA",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          { src: "logo-192.png", sizes: "192x192", type: "image/png" },
          { src: "logo-384.png", sizes: "384x384", type: "image/png" },
          { src: "logo-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  server: {
    allowedHosts: ["813230acbdbb.ngrok-free.app"],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        signup: resolve(__dirname, "signup.html"),
      },
    },
  },
});
