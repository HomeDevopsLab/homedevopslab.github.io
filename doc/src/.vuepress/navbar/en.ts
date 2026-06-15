import { navbar } from "vuepress-theme-hope";

export const enNavbar = navbar([
  "/en/",
  {
    text: "Proxmox",
    icon: "server",
    prefix: "/en/proxmox/",
    children: ["vmtemplates", "vmmachines", "template_list"],
  },
  {
    text: "Kubernetes",
    icon: "dharmachakra",
    prefix: "/en/kubernetes/",
    children: ["k8s-install", "kubevip", "helmchart", "sops", "lets-encrypt"],
  },
]);
