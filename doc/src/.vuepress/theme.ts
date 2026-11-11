import { hopeTheme } from "vuepress-theme-hope";

import { plNavbar, enNavbar } from "./navbar/index.js";
import { plSidebar, enSidebar } from "./sidebar/index.js";

import { execSync } from 'child_process';

// Sprawdź zmienną ENV, jeśli nie ma - spróbuj odpalić gita (fallback dla deweloperki lokalnej)
const gitTag = process.env.VUEPRESS_GIT_TAG || (() => {
  try { return execSync('git describe --tags --abbrev=0').toString().trim(); }
  catch { return 'unknown'; }
})();

const updatedDate = process.env.VUEPRESS_BUILD_DATE || (() => {
  try { return execSync('git log -1 --format="%cd" --date=format:"%d.%m.%Y"').toString().trim(); }
  catch { return 'unknown'; }
})();

// Stopka w stylu terminala — treść jest czysto techniczna/angielska (systemctl,
// pipeline, version...), więc ten sam szablon współdzielimy między lokalizacjami PL i EN.
// Wygląd: klasy .ab-terminal* w styles/index.scss.
const footerHtml = `
  <div class="ab-terminal" role="group" aria-label="documentation.service">
    <div class="ab-terminal-bar">
      <span class="ab-terminal-dots" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>documentation.service</span>
    </div>
    <div class="ab-terminal-body">
      <div><span class="ab-terminal-prompt">[angrybits-homelab]$</span> systemctl status documentation.service</div>
      <div><span class="ab-terminal-ok">● active (running)</span> <span class="ab-terminal-dim">since Sat 2023-02-25; k3s &amp; pve node manager</span></div>
      <div class="ab-terminal-dim">pipeline: <b>#stable</b> • version: <b>${gitTag}</b> • updated: <b>${updatedDate}</b></div>
    </div>
  </div>
`;

export default hopeTheme({
  hostname: "https://docs-lab.angrybits.pl",

  author: {
    name: "kkrolikowski",
    url: "https://kkrolikowski.github.io",
  },

  logo: "/logo.svg",

  repo: "vuepress-theme-hope/vuepress-theme-hope",

  docsDir: "src",

  locales: {
    "/": {
      // navbar
      navbar: plNavbar,

      // sidebar
      sidebar: plSidebar,

      footer: footerHtml,
      copyright: "Copyright © 2026 angrybits | Automation Powered Homelab",
      displayFooter: true,

      repoDisplay: false,
      editLink: false,

      // metaLocales: {},
    },

    "/en/": {
      // navbar
      navbar: enNavbar,

      // sidebar
      sidebar: enSidebar,

      footer: footerHtml,
      copyright: "Copyright © 2026 angrybits | Automation Powered Homelab",

      displayFooter: true,
      repoDisplay: false,
      editLink: false,

      // page meta
      // metaLocales: {},
    },
  },

  encrypt: {
    config: {
      "/demo/encrypt.html": {
        hint: "Password: 1234",
        password: "1234",
      },
      "/zh/demo/encrypt.html": {
        hint: "Password: 1234",
        password: "1234",
      },
    },
  },

  // These features are enabled for demo, only preserve features you need here
  markdown: {
    align: true,
    attrs: true,
    codeTabs: true,
    component: true,
    demo: true,
    figure: true,
    gfm: true,
    highlighter: {
      type: "shiki",
      notationDiff: true,
      collapsedLines: true
    },
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
    markmap: true,
    plantuml: true,
    preview: true,
    spoiler: true,
    stylize: [
      {
        matcher: "Recommended",
        // oxlint-disable-next-line typescript/consistent-return
        replacer: ({ tag }) => {
          if (tag === "em") {
            return {
              tag: "Badge",
              attrs: { type: "tip" },
              content: "Recommended",
            };
          }
        },
      },
    ],
    sub: true,
    sup: true,
    tabs: true,
    tasklist: true,
    vPre: true,

    // uncomment these if you need TeX support
    // math: {
    //   // install katex before enabling it
    //   type: "katex",
    //   // or install @mathjax/src before enabling it
    //   type: "mathjax",
    // },

    // install chart.js before enabling it
    // chartjs: true,

    // install echarts before enabling it
    // echarts: true,

    // install flowchart.ts before enabling it
    flowchart: true,

    // install mermaid before enabling it
    mermaid: true,

    // playground: {
    //   presets: ["ts", "vue"],
    // },

    // install @vue/repl before enabling it
    // vuePlayground: true,

    // install sandpack-vue3 before enabling it
    // sandpack: true,

    // install @vuepress/plugin-revealjs and uncomment these if you need slides
    revealjs: {
      plugins: ["highlight", "math", "search", "notes", "zoom"],
    },
  },

  plugins: {
    // Note: This is for testing ONLY!
    // You MUST generate and use your own comment service in production.
    // comment: {
    //   provider: "Giscus",
    //   repo: "vuepress-theme-hope/giscus-discussions",
    //   repoId: "R_kgDOG_Pt2A",
    //   category: "Announcements",
    //   categoryId: "DIC_kwDOG_Pt2M4COD69",
    // },

    components: {
      components: ["Badge", "VPCard"],
    },

    icon: {
      assets: "fontawesome-with-brands",
    },

    // galeria pełnoekranowa po kliknięciu: domyślny selektor (obrazki w treści stron)
    // + ilustracje sekcji strony głównej (layout LabHome)
    photoSwipe: {
      selector: ["[vp-content] :not(a) > img:not([no-view])", ".ab-figure img"],
    },

    // Install @vuepress/plugin-pwa and uncomment these if you want a PWA
    // pwa: {
    //   favicon: "/favicon.ico",
    //   cacheHTML: true,
    //   cacheImage: true,
    //   appendBase: true,
    //   apple: {
    //     icon: "/assets/icon/apple-icon-152.png",
    //     statusBarColor: "black",
    //   },
    //   msTile: {
    //     image: "/assets/icon/ms-icon-144.png",
    //     color: "#ffffff",
    //   },
    //   manifest: {
    //     icons: [
    //       {
    //         src: "/assets/icon/chrome-mask-512.png",
    //         sizes: "512x512",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-mask-192.png",
    //         sizes: "192x192",
    //         purpose: "maskable",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-512.png",
    //         sizes: "512x512",
    //         type: "image/png",
    //       },
    //       {
    //         src: "/assets/icon/chrome-192.png",
    //         sizes: "192x192",
    //         type: "image/png",
    //       },
    //     ],
    //     shortcuts: [
    //       {
    //         name: "Demo",
    //         short_name: "Demo",
    //         url: "/demo/",
    //         icons: [
    //           {
    //             src: "/assets/icon/guide-maskable.png",
    //             sizes: "192x192",
    //             purpose: "maskable",
    //             type: "image/png",
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // },
  },
});
