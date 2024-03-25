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
  },
  {
    text: "Docker Services",
    icon: "fa-brands fa-docker",
    prefix: "/services/",
    children: [
      "dns",
      "databases",
    ]
  },
  {
    text: "CI/CD Environment",
    icon: "infinitu",
    prefix: "/cicd/",
    children: [
      "gitlab",
      "kubernetes",
    ]
  }
]);
