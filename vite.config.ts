
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["icon-192.png"],
        manifest: {
          name: "Premier Plus Pharmacy & Opticals Ltd",
          short_name: "Premier Pharmacy",
          description: "Pharmacy sales, inventory and management system",
          theme_color: "#0b3b2e",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/icon-192.png",
              sizes: "192x192",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  },
});