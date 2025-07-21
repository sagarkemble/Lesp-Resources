import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    allowedHosts: ["991021d3a181.ngrok-free.app"],
  },
});
