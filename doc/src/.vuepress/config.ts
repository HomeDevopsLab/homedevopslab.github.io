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
  })

  // Enable it with pwa
  // shouldPrefetch: false,
});
