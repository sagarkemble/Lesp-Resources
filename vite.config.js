import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    allowedHosts: ["0dab1116c1b7.ngrok-free.app"],
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
