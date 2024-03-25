import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    {
      text: "Proxmox",
      icon: "server",
      prefix: "proxmox/",
      link: "proxmox/",
      children: "structure",
    },
    {
      text: "Docker Services",
      icon: "fa-brands fa-docker",
      prefix: "services/",
      link: "services/",
      children: "structure",
    },
    {
      text: "CI/CD Environment",
      icon: "infinity",
      prefix: "cicd/",
      link: "cicd/",
      children: "structure",
    }
  ],
});
