import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "Proxmox",
    icon: "server",
    prefix: "/proxmox/",
    children: ["vmtemplates", "vmmachines", "template_list"],
  },
  {
    text: "Kubernetes",
    icon: "dharmachakra",
    prefix: "/kubernetes/",
    children: ["k8s-install", "helmchart", "sops"],
  },
  {
    text: "Docker Services",
    icon: "fa-brands fa-docker",
    prefix: "/services/",
    children: ["dns", "databases"],
  },
  {
    text: "CI/CD Environment",
    icon: "infinity",
    prefix: "/cicd/",
    children: ["gitlab", "flux", "aws"],
  },
  {
    text: "Security",
    icon: "shield",
    prefix: "/security/",
    children: ["backups", "logs", "monitoring"],
  },
]);
