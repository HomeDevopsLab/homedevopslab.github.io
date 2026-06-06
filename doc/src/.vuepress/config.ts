import { defineUserConfig } from "vuepress";

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

  // Enable it with pwa
  // shouldPrefetch: false,
});
