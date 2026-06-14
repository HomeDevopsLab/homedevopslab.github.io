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


export default hopeTheme({
  hostname: "https://docs-lab.angrybits.pl",

  author: {
    name: "kkrolikowski",
    url: "https://kkrolikowski.github.io",
  },

  logo: "/assets/image/logo.png",

  repo: "vuepress-theme-hope/vuepress-theme-hope",

  docsDir: "src",

  locales: {
    "/": {
      // navbar
      navbar: plNavbar,

      // sidebar
      sidebar: plSidebar,

      footer: `
        <div style="
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 16px; 
          font-family: 'Fira Code', Consolas, Monaco, monospace; 
          font-size: 0.85rem; 
          color: #94a3b8;
          padding: 15px 0;
        ">
          <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 6px; width: fit-content;">
            <div style="color: #64748b;">
              <span style="color: #38bdf8;">[angrybits-homelab]$</span> systemctl status documentation.service
            </div>
            <div style="display: inline-flex; align-items: center; gap: 8px; padding-left: 2px;">
              <span style="
                background: rgba(0, 223, 162, 0.15); 
                color: #00dfa2; 
                padding: 2px 8px; 
                border-radius: 4px; 
                font-size: 0.75rem; 
                font-weight: bold;
                border: 1px solid rgba(0, 223, 162, 0.3);
              ">● active (running)</span>
              <span style="color: #64748b; font-size: 0.8rem;">since Sat 2023-02-25; k3s & pve node manager</span>
            </div>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; align-items: center; font-size: 0.8rem; color: #64748b; width: 100%; border-top: 1px solid rgba(148, 163, 184, 0.08); padding-top: 12px;">
            <span style="display: inline-flex; align-items: center; gap: 5px;">
              <iconify-icon icon="fa6-brands:gitlab" style="color: #fc6d26;"></iconify-icon> 
              pipeline: <span style="color: #00dfa2;">#stable</span>
            </span>
            <span>•</span>
            <span style="display: inline-flex; align-items: center; gap: 5px;">
              <iconify-icon icon="fa6-solid:tag"></iconify-icon>
              version: <span style="color: #e2e8f0; font-weight: bold;">${gitTag}</span>
            </span>
            <span>•</span>
            <span>updated: ${updatedDate}</span>
          </div>
        </div>
      `,
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

      footer: "Default footer",

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
    },
    imgLazyload: true,
    imgSize: true,
    include: true,
    mark: true,
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
    // revealjs: {
    //   plugins: ["highlight", "math", "search", "notes", "zoom"],
    // },
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
      assets: "fontawesome",
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
