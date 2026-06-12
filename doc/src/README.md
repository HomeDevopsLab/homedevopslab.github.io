---
home: true
icon: house
title: Home
heroImage: /assets/image/homelab-logo2.png
bgImage: /assets/image/hero-bg-light.svg
bgImageDark: /assets/image/hero-bg.svg
bgImageStyle:
  background-attachment: fixed
  background-position: center -15%
  background-size: contain
  background-repeat: no-repeat
  filter: brightness(0.80) contrast(0.7)
heroText: Angrybits Homelab
tagline: Dokumentacja mojego środowiska homelab
# actions:
#   - text: O projekcie
#     icon: lightbulb
#     link: ./demo/
#     type: primary

#   - text: Docs
#     link: ./guide/

highlights:
  - header: Kamienie milowe
    image: /assets/image/highlights-img.png
    bgImage: /assets/image/highlights-light.svg
    bgImageDark: /assets/image/highlights.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8)
    highlights:
      - title: "<strong>🚀 25.02.2023</strong> — Uruchamiam 2-node cluster na Raspberry Pi4"
      - title: "<strong>🏗️ 17.06.2023</strong> — Cluster zwiększa się o dwa RPi + serwer Proxmox"
      - title: "<strong>💾 18.04.2025</strong> — Uruchamiam duży NAS (8TB) do backupów"
      - title: "<strong>🛠️ 11.07.2025</strong> — Rozwój IaC (Terragrunt / Terraform / Ansible)"
      - title: "<strong>🔥 21.02.2026</strong> — Pełne capacity klastra Proxmox: 3x 64GB RAM"

  - header: Baza Wiedzy
    description: Wybierz interesujący Cię obszar, aby przejść do szczegółów
    image: /assets/image/docs-image.png
    bgImage: https://theme-hope-assets.vuejs.press/bg/2-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/2-dark.svg
    bgImageStyle:
      background-repeat: repeat
      background-size: initial
    features:
      - title: Proxmox Cluster
        icon: server
        details: Opis architektury clustra proxmox
        link: ./proxmox/
      - title: Kubernetes Cluster
        icon: dharmachakra
        details: Budowa lokalnego clustra kubernetes
        link: ./kubernetes/

  - header: Wirtualizacja Proxmox
    description: Wspólna platfoma dla wszystkich aplikacji uruchomionych w homelabie. Trzy fizyczne serwery połączone w jeden cluster ze wspólnym storage w CEPH
    image: /assets/image/logo-proxmox.svg
    bgImage: /assets/image/virtualization-bg-light.svg
    bgImageDark: /assets/image/virtualization-bg.svg
    bgImageStyle:
      background-size: cover
      background-position: center
      filter: brightness(0.5) contrast(0.8)
    highlights:
      - title: <strong>42 CPU</strong>
        icon: microchip
      - title: <strong>184 GB RAM</strong>
        icon: memory
      - title: <strong>14 TB Storage</strong>
        icon: hard-drive

  - header: Improved layouts
    description: An awesome responsive layout
    image: /assets/image/layout.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/5-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/5-dark.svg
    highlights:
      - title: Navbar
        icon: window-maximize
        details: Fully customizable navbar with improved mobile support
        link: https://theme-hope.vuejs.press/guide/layout/navbar.html

      - title: Sidebar
        icon: fas fa-window-maximize fa-rotate-270
        details: Generate sidebar based on page headings and file structure
        link: https://theme-hope.vuejs.press/guide/layout/sidebar.html

      - title: Slide Page
        icon: person-chalkboard
        details: Adding slide pages to display things you like
        link: https://theme-hope.vuejs.press/guide/layout/slides.html

      - title: Other Layout Improvement
        icon: object-group
        details: Improved page nav and new breadcrumb, footer and toc. We also bring you a brand new homepage.
        link: https://theme-hope.vuejs.press/guide/layout/

  - header: New features
    image: /assets/image/features.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/1-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/1-dark.svg
    features:
      - title: Catalog Page
        icon: network-wired
        details: Auto generating catalog page and out of box catalog component
        link: https://theme-hope.vuejs.press/guide/feature/catalog.html

      - title: Pageviews and Comments
        icon: comment-dots
        details: Pageview statistics and comment support with 4 comment service
        link: https://theme-hope.vuejs.press/guide/feature/comment.html

      - title: Article Information
        icon: circle-info
        details: Add author, writing date, reading time, word count and other information to your article
        link: https://theme-hope.vuejs.press/guide/feature/page-info.html

      - title: Article Encryption
        icon: lock
        details: Encrypt you articles based on page links, so that only the one you want could see them
        link: https://theme-hope.vuejs.press/guide/feature/encrypt.html

      - title: Search
        icon: search
        details: Support docsearch and client search
        link: https://theme-hope.vuejs.press/guide/feature/search.html

      - title: Code Block
        icon: code
        details: Customize code block themes, line number, highlight lines, copy button, etc.
        link: https://theme-hope.vuejs.press/guide/markdown/code/fence.html

      - title: Image Preview
        icon: image
        details: Support viewing, zooming, sharing your page images like a gallery
        link: https://theme-hope.vuejs.press/guide/feature/photo-swipe.html

  - header: Blogging
    description: Create personal blog with theme
    image: /assets/image/blog.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/5-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/5-dark.svg
    highlights:
      - title: Blog features
        icon: blog
        details: Listing your articles with their dates, tags and categories
        link: https://theme-hope.vuejs.press/guide/blog/intro.html

      - title: Blog homepage
        icon: blog
        details: New blog homepage
        link: https://theme-hope.vuejs.press/guide/blog/home.html

      - title: Blogger info
        icon: circle-info
        details: Customize avatar, name, slogan, introduction and social links
        link: https://theme-hope.vuejs.press/guide/blog/blogger.html

      - title: Timeline
        icon: clock
        details: Read through blog posts in a timeline
        link: https://theme-hope.vuejs.press/guide/blog/timeline.html

  - header: Advanced
    description: Advanced features to improve site SEO and user experience
    image: /assets/image/advanced.svg
    bgImage: https://theme-hope-assets.vuejs.press/bg/4-light.svg
    bgImageDark: https://theme-hope-assets.vuejs.press/bg/4-dark.svg
    highlights:
      - title: SEO Enhancement
        icon: dumbbell
        details: Optimize pages for search engines
        link: https://theme-hope.vuejs.press/guide/advanced/seo.html

      - title: Sitemap
        icon: sitemap
        details: Generate a Sitemap for your site
        link: https://theme-hope.vuejs.press/guide/advanced/sitemap.html

      - title: Feed
        icon: rss
        details: Generate feed to allow users to subscribe it
        link: https://theme-hope.vuejs.press/guide/advanced/feed.html

      - title: PWA
        icon: mobile-screen
        details: Make your site more like an APP
        link: https://theme-hope.vuejs.press/guide/advanced/pwa.html

copyright: false
footer: Theme by <a href="https://theme-hope.vuejs.press/" target="_blank">VuePress Theme Hope</a> | MIT Licensed, Copyright © 2019-present Mr.Hope
---

This is an example of a project homepage. You can place your main content here.

To use this layout, you need to set `home: true` in the page front matter.

For related descriptions of configuration items, please see [Project HomePage Layout Config](https://theme-hope.vuejs.press/guide/layout/home.html).
