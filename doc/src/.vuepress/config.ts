import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  lang: "en-US",
  title: "Docs HomeLab",
  description: "Dokumentacja środowiska HomeLab",

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
