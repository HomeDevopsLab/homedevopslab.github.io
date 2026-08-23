import { navbar } from "vuepress-theme-hope";

export const plNavbar = navbar([
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
    children: ["k8s-install", "k8s-upgrade", "kubevip", "flux", "helmchart", "sops", "lets-encrypt"],
  },
  {
    text: "Gitops",
    icon: "infinity",
    prefix: "/gitops/",
    children: ["gitlab"],
  },
  {
    text: "Security",
    icon: "shield",
    prefix: "/security/",
    children: ["backups"],
  }
]);
