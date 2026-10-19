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
    children: ["k8s-install", "k8s-upgrade", "kubevip", "flux", "helmchart", "sops", "lets-encrypt"],
  },
  {
    text: "Talos Cluster",
    icon: "https://cdn.simpleicons.org/talos/fff",
    prefix: "/en/talos/",
    children: ["cluster-install", "cluster-updates", "cluster-scale"],
  },
  {
    text: "Gitops",
    icon: "infinity",
    prefix: "/en/gitops/",
    children: ["gitlab", "pipeline-schedules"],
  },
  {
    text: "Security",
    icon: "shield",
    prefix: "/en/security/",
    children: ["backups"],
  }
]);
