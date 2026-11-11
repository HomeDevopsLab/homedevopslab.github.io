<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { RouteLink, withBase } from "vuepress/client";
import { MainLayout, useData } from "vuepress-theme-hope/client";

interface Link {
  text: string;
  link: string;
}
interface Action extends Link {
  type?: "primary" | "default";
}
interface Milestone {
  date: string;
  text: string;
}
interface Card {
  title: string;
  details: string;
  icon: string;
  link: string;
}
interface Stat {
  value: string;
  label: string;
}
interface Feature {
  title: string;
  details: string;
}
interface Section {
  title: string;
  description: string;
  cta?: Link;
  image: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  stats?: Stat[];
  features?: Feature[];
}
interface LabHomeFrontmatter extends Record<string, unknown> {
  hero: {
    title: string;
    tagline: string;
    image: string;
    imageAlt?: string;
    actions?: Action[];
  };
  milestones?: {
    title: string;
    image?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
    items: Milestone[];
  };
  knowledge?: {
    id?: string;
    title: string;
    description?: string;
    cards: Card[];
  };
  sections?: Section[];
}

const { frontmatter, routePath } = useData<LabHomeFrontmatter>();

const hero = computed(() => frontmatter.value.hero);
const milestones = computed(() => frontmatter.value.milestones);
const knowledge = computed(() => frontmatter.value.knowledge);
const sections = computed(() => frontmatter.value.sections ?? []);

// Topologia wokół logo w hero: 6 węzłów na sześciokącie (r = 150, środek 200,200).
// Glify to ścieżki w siatce 24×24 (obrys), dekoracyjne — aria-hidden.
const ring = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

const glyphs = {
  git: `${ring(6, 5, 2.5)}${ring(6, 19, 2.5)}${ring(18, 8, 2.5)}M6 7.5v9M18 10.5c0 4-6 3-12 6`,
  cloud: "M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.6 4.3 4.3 0 0 0 7 18z",
  kubernetes: `${ring(12, 12, 9)}${ring(12, 12, 2.5)}M12 3v6.5M12 14.5V21M3 12h6.5M14.5 12H21`,
  server:
    "M4.5 4h15A1.5 1.5 0 0 1 21 5.5v4a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 9.5v-4A1.5 1.5 0 0 1 4.5 4zM4.5 13h15a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5v-4A1.5 1.5 0 0 1 4.5 13zM7 7.5h.01M7 16.5h.01",
  database:
    "M4 5a8 3 0 1 0 16 0a8 3 0 1 0-16 0M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
  shield:
    "M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3zM9 12l2.2 2.2L15.5 10",
};

const nodes = (
  ["git", "cloud", "kubernetes", "server", "database", "shield"] as const
).map((glyph, i) => {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return {
    x: +(200 + 150 * Math.cos(angle)).toFixed(1),
    y: +(200 + 150 * Math.sin(angle)).toFixed(1),
    d: glyphs[glyph],
  };
});

const hexPoints = nodes.map(({ x, y }) => `${x},${y}`).join(" ");

const isInternal = (link: string): boolean => link.startsWith("/");

// Leniwe pojawianie się treści: elementy .ab-reveal* dostają .is-visible, gdy wejdą
// w viewport (raz). Klasa .ab-animate na korzeniu włącza stan początkowy dopiero po
// starcie JS — bez JS (i przy prefers-reduced-motion) treść jest od razu widoczna.
// Grafiki: .is-loaded na <figure> po załadowaniu pliku (do tego czasu placeholder).
const root = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | undefined;

const setupReveal = (): void => {
  const el = root.value;
  if (!el) return;

  el.querySelectorAll<HTMLImageElement>(".ab-figure img").forEach((img) => {
    const figure = img.closest(".ab-figure");
    const done = (): void => figure?.classList.add("is-loaded");
    if (img.complete && img.naturalWidth > 0) done();
    else {
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }
  });

  observer?.disconnect();
  if (!("IntersectionObserver" in window)) return;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  el.querySelectorAll(".ab-reveal, .ab-reveal-img, .ab-reveal-line").forEach(
    (node) => observer?.observe(node),
  );
  el.classList.add("ab-animate");
};

onMounted(setupReveal);
// przełączenie języka (PL <-> EN) ponownie używa tego samego layoutu
watch(routePath, () => nextTick(setupReveal));
onBeforeUnmount(() => observer?.disconnect());
const asset = (src: string): string =>
  /^(https?:)?\/\//.test(src) ? src : withBase(src);
</script>

<template>
  <MainLayout container-class="ab-home-container" no-sidebar no-toc>
    <div ref="root" class="ab-home">
      <div class="ab-progress" aria-hidden="true" />

      <main id="main-content" class="ab-main">
        <!-- HERO -->
        <section class="ab-hero">
          <div class="ab-hero-glow" aria-hidden="true" />
          <div class="ab-floor" aria-hidden="true"><div class="ab-floor-grid" /></div>
          <div class="ab-horizon" aria-hidden="true" />
          <span class="ab-streak ab-streak-1" aria-hidden="true" />
          <span class="ab-streak ab-streak-2" aria-hidden="true" />
          <span class="ab-streak ab-streak-3" aria-hidden="true" />

          <div class="ab-hero-out ab-topology">
            <svg
              class="ab-topology-svg"
              viewBox="0 0 400 400"
              aria-hidden="true"
              focusable="false"
            >
              <circle class="ab-topo-ring" cx="200" cy="200" r="190" />
              <polygon class="ab-topo-hex" :points="hexPoints" />
              <polygon class="ab-topo-hex-flow" :points="hexPoints" />
              <line
                v-for="(node, i) in nodes"
                :key="`link-${i}`"
                class="ab-topo-link"
                x1="200"
                y1="200"
                :x2="node.x"
                :y2="node.y"
              />
              <line
                v-for="(node, i) in nodes"
                :key="`flow-${i}`"
                class="ab-topo-flow"
                :class="{ 'ab-topo-flow-rev': i % 2 }"
                :style="{ animationDelay: `${-i * 0.45}s` }"
                x1="200"
                y1="200"
                :x2="node.x"
                :y2="node.y"
              />
              <circle class="ab-topo-core" cx="200" cy="200" r="86" />
              <g
                v-for="(node, i) in nodes"
                :key="`node-${i}`"
                :transform="`translate(${node.x} ${node.y})`"
              >
                <g class="ab-topo-node" :style="{ animationDelay: `${i * 0.7}s` }">
                  <rect x="-25" y="-25" width="50" height="50" rx="13" />
                  <path :d="node.d" transform="translate(-12 -12)" />
                </g>
              </g>
            </svg>
            <img
              class="ab-hero-logo"
              :src="asset(hero.image)"
              :alt="hero.imageAlt ?? ''"
              width="136"
              height="136"
            />
          </div>

          <h1 class="ab-hero-out ab-hero-title">{{ hero.title }}</h1>
          <p class="ab-hero-out ab-hero-tagline">
            <span class="ab-prompt" aria-hidden="true">$</span>
            <span class="ab-typed" :style="{ '--chars': hero.tagline.length }">{{
              hero.tagline
            }}</span>
          </p>

          <div v-if="hero.actions?.length" class="ab-hero-out ab-actions">
            <template v-for="action in hero.actions" :key="action.text">
              <RouteLink
                v-if="isInternal(action.link)"
                :to="action.link"
                class="ab-btn"
                :class="{ 'ab-btn-primary': action.type === 'primary' }"
                >{{ action.text }}</RouteLink
              >
              <a
                v-else
                :href="action.link"
                class="ab-btn"
                :class="{ 'ab-btn-primary': action.type === 'primary' }"
                >{{ action.text }}</a
              >
            </template>
          </div>
        </section>

        <!-- KAMIENIE MILOWE -->
        <section v-if="milestones" class="ab-section">
          <div class="ab-wrap ab-split">
            <div class="ab-copy">
              <h2 class="ab-h2 ab-reveal">{{ milestones.title }}</h2>
              <ol class="ab-timeline ab-reveal-line">
                <li
                  v-for="(item, i) in milestones.items"
                  :key="item.date"
                  class="ab-reveal"
                  :style="{ '--i': i + 1 }"
                >
                  <span class="ab-dot" aria-hidden="true" />
                  <span class="ab-timeline-body">
                    <time class="ab-date">{{ item.date }}</time>
                    <span>{{ item.text }}</span>
                  </span>
                </li>
              </ol>
            </div>
            <figure v-if="milestones.image" class="ab-figure ab-reveal-img">
              <img
                :src="asset(milestones.image)"
                :alt="milestones.imageAlt ?? ''"
                :width="milestones.imageWidth"
                :height="milestones.imageHeight"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        <!-- BAZA WIEDZY -->
        <section
          v-if="knowledge"
          :id="knowledge.id ?? 'knowledge'"
          class="ab-section ab-knowledge"
        >
          <div class="ab-nebula ab-nebula-right" aria-hidden="true" />
          <div class="ab-wrap">
            <div class="ab-heading-center ab-reveal">
              <h2 class="ab-h2">{{ knowledge.title }}</h2>
              <p v-if="knowledge.description">{{ knowledge.description }}</p>
            </div>
            <div class="ab-cards">
              <RouteLink
                v-for="(card, i) in knowledge.cards"
                :key="card.title"
                :to="card.link"
                class="ab-card ab-reveal"
                :style="{ '--i': i }"
              >
                <span class="ab-card-icon" aria-hidden="true">
                  <VPIcon :icon="card.icon" />
                </span>
                <span class="ab-card-title">{{ card.title }}</span>
                <span class="ab-card-details">{{ card.details }}</span>
                <span class="ab-card-arrow" aria-hidden="true">→</span>
              </RouteLink>
            </div>
          </div>
        </section>

        <!-- SEKCJE TEMATYCZNE -->
        <section
          v-for="(section, index) in sections"
          :key="section.title"
          class="ab-section"
        >
          <div
            class="ab-nebula"
            :class="index % 2 ? 'ab-nebula-right' : 'ab-nebula-left'"
            aria-hidden="true"
          />
          <div
            class="ab-wrap ab-split"
            :class="{ 'ab-split-reverse': index % 2 === 0 }"
          >
            <div class="ab-copy">
              <h2 class="ab-h2 ab-h2-sm ab-reveal">{{ section.title }}</h2>
              <p class="ab-lead ab-reveal">{{ section.description }}</p>
              <RouteLink
                v-if="section.cta"
                :to="section.cta.link"
                class="ab-cta ab-reveal"
                :style="{ '--i': 1 }"
                >{{ section.cta.text }} <span aria-hidden="true">→</span></RouteLink
              >

              <ul v-if="section.stats?.length" class="ab-stats">
                <li
                  v-for="(stat, i) in section.stats"
                  :key="stat.value"
                  class="ab-reveal"
                  :style="{ '--i': i + 2 }"
                >
                  <span class="ab-stat-value">{{ stat.value }}</span>
                  <span class="ab-stat-label">{{ stat.label }}</span>
                </li>
              </ul>

              <ul v-if="section.features?.length" class="ab-features">
                <li
                  v-for="(feature, i) in section.features"
                  :key="feature.title"
                  class="ab-reveal"
                  :style="{ '--i': i + 2 }"
                >
                  <span class="ab-diamond" aria-hidden="true" />
                  <span class="ab-feature-body">
                    <span class="ab-feature-title">{{ feature.title }}</span>
                    <span class="ab-feature-details">{{ feature.details }}</span>
                  </span>
                </li>
              </ul>
            </div>
            <figure class="ab-figure ab-reveal-img">
              <img
                :src="asset(section.image)"
                :alt="section.imageAlt ?? ''"
                :width="section.imageWidth"
                :height="section.imageHeight"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>
      </main>
    </div>
  </MainLayout>
</template>

<style lang="scss">
@use "../styles/lab-home";
</style>
