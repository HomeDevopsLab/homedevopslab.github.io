import { defineUserConfig } from "vuepress";
import { viteBundler } from "@vuepress/bundler-vite";

import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "pl-PL",
      title: "Dokumentacja Homelab",
      description: "Strona z dokumentacją homelaba",
    },
    "/en/": {
      lang: "en-EN",
      title: "Homelab Documentation",
      description: "Documantation page for my homelab",
    },
  },

  head: [
    ["link", { rel: "preconnect", href: "https://fonts.googleapis.com" }],
    ["link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" }],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Jersey+10&family=Press+Start+2P&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
    ["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }],
    ["link", { rel: "apple-touch-icon", href: "/assets/icon/apple-icon-152.png" }],
  ],

  theme,

  bundler: viteBundler({
    viteOptions: {
      build: {
        rollupOptions: {
          onwarn(warning, warn) {
            // Ignoruj specyficzne ostrzeżenia o błędnych adnotacjach z node_modules
            if (warning.code === 'INVALID_ANNOTATION') {
              return;
            }
            // Wszystkie inne ostrzeżenia pokazuj normalnie
            warn(warning);
          },
        }
      }
    }
  }),

  // Enable it with pwa
  // shouldPrefetch: false,
});
