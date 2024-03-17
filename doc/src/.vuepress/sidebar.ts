import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    {
      text: "Proxmox",
      icon: "laptop-code",
      prefix: "proxmox/",
      link: "proxmox/",
      children: "structure",
    }
  ],
});
