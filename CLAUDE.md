# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static documentation site for a homelab environment, built with [VuePress Theme Hope](https://theme-hope.vuejs.press/). All active work lives in the `doc/` directory. The `olddoc/` directory is a legacy version and should be ignored.

The site is bilingual: Polish (`/`) is the primary locale; English lives under `/en/`.

## Commands

All commands run from `doc/`:

```bash
cd doc
npm run docs:dev          # Start dev server (local preview)
npm run docs:clean-dev    # Start dev server with cache cleared
npm run docs:build        # Build static output to doc/src/.vuepress/dist/
npm run docs:update-package  # Update VuePress packages
```

## Architecture

### Content

Markdown pages live in `doc/src/`. The site is organized by topic:
- `doc/src/proxmox/` — Polish Proxmox docs
- `doc/src/kubernetes/` — Polish Kubernetes docs
- `doc/src/en/proxmox/` and `doc/src/en/kubernetes/` — English mirrors of the same topics

### Navigation configuration

Navigation is split across separate files per locale:
- `doc/src/.vuepress/navbar/pl.ts` and `navbar/en.ts` — top navbar
- `doc/src/.vuepress/sidebar/pl.ts` and `sidebar/en.ts` — side menu

Sidebar sections use `children: "structure"` to auto-discover pages from the directory; adding a new `.md` file in `proxmox/` or `kubernetes/` makes it appear automatically without editing the sidebar config.

### Theme and plugins

`doc/src/.vuepress/theme.ts` is the central config: locales, navbar/sidebar wiring, footer, and enabled markdown plugins. The footer dynamically injects the git commit hash and build date — either from `VUEPRESS_COMMIT_SHA`/`VUEPRESS_BUILD_DATE` env vars (set by CI) or via `git` fallback at build time.

Enabled markdown extras: Mermaid diagrams, Flowchart, code tabs, task lists, PlantUML, Shiki syntax highlighting, figure/image lazy-loading.

### Deployment

CI (`.gitlab-ci.yml`) triggers only on git tags. It:
1. Fetches Docker registry credentials from Vault via JWT auth
2. Builds a multi-arch Docker image (`linux/amd64`, `linux/arm64/v8`) using the `Dockerfile`
3. Pushes the image tagged with the git tag to the registry

The `Dockerfile` is a two-stage build: Node 22 Alpine builds the static files, then copies them into an `nginx:latest` image.

## Versioning scheme

The project follows semantic versioning (`MAJOR.MINOR.PATCH`) with these rules:

- **MAJOR** — new top-level section added (e.g. a new topic alongside Proxmox/Kubernetes), complete site restructure, or VuePress engine upgrade
- **MINOR** — new article added within an existing top-level section; new subsection (e.g. `kubernetes/networking/`) also counts as minor
- **PATCH** — update or correction to an existing document (both typo fixes and substantive content changes)

Adding a translation of an existing article is `patch`; adding a translated version of a new article follows the same bump as the article itself.

Every bump gets a git tag — CI deploys on tags, so each version (including patches) triggers a release.

## CHANGELOG rules

- Avoid low-level details. Keep it to 1–2 sentences that clearly describe the business impact.
