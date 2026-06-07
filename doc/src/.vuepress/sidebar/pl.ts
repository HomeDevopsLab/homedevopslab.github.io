import { sidebar } from "vuepress-theme-hope";

export const plSidebar = sidebar({
  "/": [
    {
      text: "Proxmox",
      icon: "server",
      prefix: "proxmox/",
      link: "proxmox/",
      children: "structure",
    },
  ],
});
