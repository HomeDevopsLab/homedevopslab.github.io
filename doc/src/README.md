---
title: HomeLab
index: false
icon: flask
home: true
heroImage: /assets/image/homelab-doc.jpeg
bgImageDark: /assets/image/head-bg-dark.svg
bgImage: /assets/image/head-bg-light.svg
heroText: HomeLAB Doc
tagline: Dokumentacja mojego środowiska homelab
actions:
  - text: Proxmox
    icon: server
    link: ./proxmox/
    type: primary
  - text: Usługi
    icon: fa-brands fa-docker
    link: ./services/
    type: primary
  - text: CI/CD
    icon: infinity
    link: ./cicd/
    type: primary

highlights:
  - header: Platforma wirtualizacji
    image: /assets/image/docker.png
    bgImage: /assets/image/cicd-bg-light.svg
    bgImageDark: /assets/image/cicd-bg-dark.svg
    highlights:
      - title: Wykorzystanie proxmoxa jako platformy do wirtualizacji
      - title: Wykorzystanie kontenerów do uruchamiania usług
  - header: Continous Integration i Delivery
    image: /assets/image/gitops.png
    bgImage: /assets/image/cicd-bg-light.svg
    bgImageDark: /assets/image/cicd-bg-dark.svg
    highlights:
      - title: Praca ze środowiskiem w modelu GitOps
      - title: Automatyka wdrażania infrastruktury i oprogramowania
  - header: Kluczowe zagadnienia
    description: Rzeczy o których warto wiedzieć podczas pracy z HomeLAB
    image: /assets/image/important.jpeg
    bgImage: /assets/image/important-bg-light.svg
    bgImageDark: /assets/image/important-dark.svg
    features:
      - title: Logi Kontenerów
        icon: binoculars
        details: Jak skonfigurowane są logi w kontenerach dockera na VM-kach.
        link: ./services/
      - title: Serwer Proxmox
        icon: server
        details: Jakie parametry ma serwer Proxmox w HomeLabie
        link: ./proxmox/
      - title: GitOps
        icon: infinity
        details: W jaki sposób wdrażam i zarządzam konfiguracją w HomeLAB
        link: ./cicd/
---
