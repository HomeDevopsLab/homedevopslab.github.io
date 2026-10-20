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
    text: "Talos Cluster",
    icon: "https://cdn.simpleicons.org/talos/fff",
    prefix: "/talos/",
    children: ["cluster-install", "cluster-updates", "cluster-scale", "cluster-k8s"],
  },
  {
    text: "Gitops",
    icon: "infinity",
    prefix: "/gitops/",
    children: ["gitlab", "pipeline-schedules"],
  },
  {
    text: "Security",
    icon: "shield",
    prefix: "/security/",
    children: ["backups"],
  }
]);
