import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    allowedHosts: ["034bc013c5c7.ngrok-free.app"],
  },
});
