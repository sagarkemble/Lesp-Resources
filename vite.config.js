import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";
export default defineConfig({
  plugins: [
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt"],
      manifest: {
        name: "Lesp resources",
        short_name: "Lesp",
        description: "Lesp resources PWA",
        theme_color: "#000000",
        background_color: "#000000",
        display: "standalone",
      },
    }),
    pwaAssetsGenerator({
      image: "public/logo.png", // your master icon
      resizeOptions: { fit: "contain" },
      sizes: [192, 256, 384, 512], // will be generated automatically
    }),
  ],
  server: {
    allowedHosts: ["486822b4d06f.ngrok-free.app"],
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
