import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "Proxmox",
    icon: "server",
    prefix: "/proxmox/",
    children: [
      "vmtemplates",
      "vmmachines",
      "template_list"
    ]
  }
]);
