---
title: Pipeline schedules
icon: clock
order: 2
category:
  - Guide
tag:
  - cicd
---
The pipeline schedules feature runs jobs defined in a CI/CD pipeline on a schedule. I use it to regularly upgrade the operating systems of my virtual machines and to run infrastructure reviews.

The **angrybits-homelab** repository has been extended with additional configuration:

* `.gitlab/mcp/alerts_ack-mcp.json.tpl`: MCP server configuration for Grafana.
* `.gitlab/mcp/firewall-mcp.json.tpl`: MCP server configuration for the Cloudflare GraphQL API.
* `.gitlab/prompts`: directory containing the prompt files. Their names are passed as variables to the scheduled jobs.
* `.opencode/opencode.json`: OpenCode configuration. It contains the list of available models, the connection to the local LLM and the permission definitions.

## Defined jobs

| Schedule name          | Schedule    | Repository        | Variables |
| ---------------------- | ----------- | ----------------- | --------- |
| System upgrades        | 7 7 * * 6   | homelab-tasks     | None      |
| Grafana Storage Alerts | 00 20 * * * | angrybits-homelab | MODEL=vllm/Qwen3.8-27B-UD-Q4_K_M<br>PROMPT_FILE=grafana-storage-alerts.md |
| IP Blacklist update    | 00 7 * * *  | angrybits-homelab | MODEL=claude-opus-5<br>PROMPT_FILE=cloudflare-review.md |

## System upgrades

The job runs every Saturday at 7:07 and upgrades the operating systems on the virtual machines. At the end of each run, a report is sent to the technical channel of the messaging app, listing which hosts were upgraded, which needed no upgrade and which require a reboot.

![System upgrades job notification =500x](/assets/image/system-upgrades.png)

## Grafana Storage Alerts

The job uses OpenCode with a local LLM and the MCP server for Grafana. It executes the **pause-and-resume-alerts** skill, which describes how to read the current disk usage of the servers and the rules for updating the alert configuration code. The goal of the job is to pause alerts once disk usage exceeds the 80% threshold and to resume them when free space increases again.

![Grafana Alerts Remediation process diagram](/assets/image/grafana-alerts-remediation.png)

### Parameters

In the job definition you can choose the LLM model and specify the name of the prompt file to execute.

### Result

* Modification of the `apps/grafana/alerts/hosts.hcl` file.
* A merge request is prepared.

## IP Blacklist update

The job uses Claude Code with the Claude Opus 5 model. It relies on the **cloudflare-ip-threat-mitigate** skill, which describes how to analyse Cloudflare logs. The analysis covers two datasets:

* `httpRequestsAdaptiveGroups` over a 7-day window,
* `firewallEventsAdaptive` over a 24-hour window.

![IP Blacklist update process](/assets/image/ip-blacklist-update.png)

The outcome of the analysis is an updated IP blacklist in Cloudflare and on my local router.

### Parameters

In the job definition you can choose the LLM model and specify the name of the prompt file to execute.

### Result

* Modification of the files:
  * `apps/cloudflare/security/ip-blacklist.hcl`
  * `apps/mikrotik/firewall/ip-blacklist.hcl`
* A merge request is prepared.
