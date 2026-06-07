---
home: true
icon: house
title: Home
heroImage: /assets/image/homelab-logo2.png
bgImage: /assets/image/hero-bg.svg
bgImageDark: /assets/image/hero-bg.svg
bgImageStyle:
  background-attachment: fixed
  background-position: center -15%
  background-size: contain # <--- KLUCZOWA ZMIANA
  background-repeat: no-repeat # Zabezpieczenie przed kafelkowaniem
  filter: brightness(0.80) contrast(0.7)
heroText: Angrybits Homelab
tagline: My homelab environment documentation
# actions:
#   - text: 使用指南
#     icon: lightbulb
#     link: ./demo/
#     type: primary

#   - text: 文档
#     link: ./guide/

highlights:
  - header: Milestones
    image: /assets/image/highlights-img.png
    bgImage: /assets/image/highlights-light.svg
    bgImageDark: /assets/image/highlights.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8) # Przyciemnia niebieską sieć i wtapia ją w głęboki granat
    highlights:
      - title: "<strong>🚀 25.02.2023</strong> — Launching a 2-node cluster on Raspberry Pi 4"
      - title: "<strong>🏗️ 17.06.2023</strong> — Cluster scales up with two additional RPis and Proxmox server"
      - title: "<strong>💾 18.04.2025</strong> — Deploying a large NAS (8TB) for backups"
      - title: "<strong>🛠️ 11.07.2025</strong> — IaC development (Terragrunt / Terraform / Ansible)"
      - title: "<strong>🔥 21.02.2026</strong> — Proxmox cluster reaches full capacity: 3x 64GB RAM"

  - header: Knowledge Base
    description: Select a category below to explore the documentation
    image: /assets/image/docs-image.png
    bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: Proxmox Cluster
        icon: server
        details: Proxmox Cluster Architecture Overview
        link: ./proxmox/

  - header: Proxmox Virtualization
    description: Unified platform hosting all homelab applications. Three physical servers configured as a single cluster with shared Ceph storage.
    image: /assets/image/logo-proxmox.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/9-light.svg
    bgImageDark: /assets/image/virtualization-bg.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8)
    highlights:
      - title: <strong>42 CPU Cores</strong>
        icon: microchip
      - title: <strong>184 GB RAM</strong>
        icon: memory
      - title: <strong>14 TB Storage</strong>
        icon: hard-drive

  - header: 布局
    description: 一个完美的响应式布局。
    image: /assets/image/layout.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/5-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/5-dark.svg
    highlights:
      - title: 导航栏
        icon: window-maximize
        details: 完全可定制的导航栏以及改进的移动端外观
        link: https://theme-hope.vuejs.press/zh/guide/layout/navbar.html

      - title: 侧边栏
        icon: fas fa-window-maximize fa-rotate-270
        details: 从文档标题或文件结构中自动生成侧边栏
        link: https://theme-hope.vuejs.press/zh/guide/layout/sidebar.html

      - title: 幻灯片页面
        icon: person-chalkboard
        details: 添加幻灯片页面以显示你喜欢的内容
        link: https://theme-hope.vuejs.press/zh/guide/layout/slides.html

      - title: 布局增强
        icon: object-group
        details: 添加路径导航、页脚、改进的导航栏、改进的页面导航等。
        link: https://theme-hope.vuejs.press/zh/guide/layout/

      - title: 更多
        icon: ellipsis
        details: RTL 布局，打印支持，全局按钮等
        link: https://theme-hope.vuejs.press/zh/guide/interface/others.html

  - header: 新功能
    image: /assets/image/features.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/1-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/1-dark.svg
    features:
      - title: 目录页面
        icon: network-wired
        details: 自动生成目录页以及开箱即用的目录组件
        link: https://theme-hope.vuejs.press/zh/guide/feature/catalog.html

      - title: 浏览量与评论
        icon: comment-dots
        details: 配合 4 个评论服务开启阅读量统计与评论支持
        link: https://theme-hope.vuejs.press/zh/guide/feature/comment.html

      - title: 文章信息
        icon: circle-info
        details: 为你的文章添加作者、写作日期、预计阅读时间、字数统计等信息
        link: https://theme-hope.vuejs.press/zh/guide/feature/page-info.html

      - title: 文章加密
        icon: lock
        details: 你可以为你的特定页面或特定目录进行加密，以便陌生人不能随意访问它们
        link: https://theme-hope.vuejs.press/zh/guide/feature/encrypt.html

      - title: 搜索支持
        icon: search
        details: 支持 docsearch 和基于客户端的搜索
        link: https://theme-hope.vuejs.press/zh/guide/feature/search.html

      - title: 代码块
        icon: code
        details: 自定义代码块主题、行号、行高亮、复制按钮等
        link: https://theme-hope.vuejs.press/zh/guide/markdown/code/fence.html

      - title: 图片预览
        icon: image
        details: 像相册一样允许你浏览、缩放并分享你的页面图片
        link: https://theme-hope.vuejs.press/zh/guide/feature/photo-swipe.html

  - header: 博客
    description: 通过主题创建个人博客
    image: /assets/image/blog.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/5-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/5-dark.svg
    highlights:
      - title: 博客功能
        icon: blog
        details: 通过文章的日期、标签和分类展示文章
        link: https://theme-hope.vuejs.press/zh/guide/blog/intro.html

      - title: 博客主页
        icon: house
        details: 全新博客主页
        link: https://theme-hope.vuejs.press/zh/guide/blog/home.html

      - title: 博主信息
        icon: circle-info
        details: 自定义名称、头像、座右铭和社交媒体链接
        link: https://theme-hope.vuejs.press/zh/guide/blog/blogger.html

      - title: 时间线
        icon: clock
        details: 在时间线中浏览和通读博文
        link: https://theme-hope.vuejs.press/zh/guide/blog/timeline.html

  - header: 高级
    description: 增强站点与用户体验的高级功能
    image: /assets/image/advanced.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/4-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/4-dark.svg
    highlights:
      - title: SEO 增强
        icon: dumbbell
        details: 将最终生成的网页针对搜索引擎进行优化。
        link: https://theme-hope.vuejs.press/zh/guide/advanced/seo.html

      - title: Sitemap
        icon: sitemap
        details: 自动为你的网站生成 Sitemap
        link: https://theme-hope.vuejs.press/zh/guide/advanced/sitemap.html

      - title: Feed 支持
        icon: rss
        details: 生成你的 Feed，并通知你的用户订阅它
        link: https://theme-hope.vuejs.press/zh/guide/advanced/feed.html

      - title: PWA 支持
        icon: mobile-screen
        details: 让你的网站更像一个 APP
        link: https://theme-hope.vuejs.press/zh/guide/advanced/pwa.html

copyright: false
footer: 使用 <a href="https://theme-hope.vuejs.press/zh/" target="_blank">VuePress Theme Hope</a> 主题 | MIT 协议, 版权所有 © 2019-至今 Mr.Hope
---

这是项目主页的案例。你可以在这里放置你的主体内容。

想要使用此布局，你需要在页面 front matter 中设置 `home: true`。

配置项的相关说明详见 [项目主页配置](https://theme-hope.vuejs.press/zh/guide/layout/home.html)。
