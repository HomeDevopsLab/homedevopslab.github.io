import { sidebar } from "vuepress-theme-hope";

export const enSidebar = sidebar({
  "/en/": [
    {
      text: "Proxmox",
      icon: "server",
      prefix: "proxmox/",
      link: "proxmox/",
      children: "structure",
    },
    {
      text: "Talos Cluster",
      icon: "https://cdn.simpleicons.org/talos/fff",
      prefix: "talos/",
      link: "talos/",
      children: "structure",
    },
    {
      text: "Kubernetes",
      icon: "dharmachakra",
      prefix: "kubernetes/",
      link: "kubernetes/",
      children: "structure",
    },
    {
      text: "Gitops",
      icon: "infinity",
      prefix: "gitops/",
      link: "gitops/",
      children: "structure",
    },
    {
      text: "Security",
      icon: "shield",
      prefix: "security/",
      link: "security/",
      children: "structure",
    },
  ],
});
