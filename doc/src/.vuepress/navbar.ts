import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "Proxmox",
    icon: "lightbulb",
    prefix: "/proxmox/",
    children: [
      "vmtemplates",
    ]
  }
]);
