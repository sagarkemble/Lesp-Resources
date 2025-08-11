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
        name: "Lesp Resources",
        short_name: "Lesp",
        description: "Lesp Resources PWA",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
        icons: [
          { src: "logo-48.png", sizes: "48x48", type: "image/png" },
          { src: "logo-72.png", sizes: "72x72", type: "image/png" },
          { src: "logo-96.png", sizes: "96x96", type: "image/png" },
          { src: "logo-128.png", sizes: "128x128", type: "image/png" },
          { src: "logo-144.png", sizes: "144x144", type: "image/png" },
          { src: "logo-152.png", sizes: "152x152", type: "image/png" },
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
