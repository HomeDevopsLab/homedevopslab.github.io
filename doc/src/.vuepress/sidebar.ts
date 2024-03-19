import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    {
      text: "Proxmox",
      icon: "server",
      prefix: "proxmox/",
      link: "proxmox/",
      children: "structure",
    }
  ],
});
