<script setup lang="ts">
import { computed } from "vue";
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
  stats?: Stat[];
  features?: Feature[];
}
interface SpaceHomeFrontmatter extends Record<string, unknown> {
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

const { frontmatter } = useData<SpaceHomeFrontmatter>();

const hero = computed(() => frontmatter.value.hero);
const milestones = computed(() => frontmatter.value.milestones);
const knowledge = computed(() => frontmatter.value.knowledge);
const sections = computed(() => frontmatter.value.sections ?? []);

const isInternal = (link: string): boolean => link.startsWith("/");
const asset = (src: string): string =>
  /^(https?:)?\/\//.test(src) ? src : withBase(src);
</script>

<template>
  <MainLayout container-class="ab-home-container" no-sidebar no-toc>
    <div class="ab-home">
      <div class="ab-progress" aria-hidden="true" />

      <main id="main-content" class="ab-main">
        <!-- HERO -->
        <section class="ab-hero">
          <div class="ab-hero-glow" aria-hidden="true" />
          <div class="ab-planet" aria-hidden="true" />
          <div class="ab-comet" aria-hidden="true" />

          <div class="ab-hero-out ab-orbits">
            <div class="ab-orbit ab-orbit-a" aria-hidden="true"><span /></div>
            <div class="ab-orbit ab-orbit-b" aria-hidden="true"><span /></div>
            <img
              class="ab-hero-logo"
              :src="asset(hero.image)"
              :alt="hero.imageAlt ?? ''"
              width="168"
              height="168"
            />
          </div>

          <h1 class="ab-hero-out ab-hero-title">{{ hero.title }}</h1>
          <p class="ab-hero-out ab-hero-tagline">{{ hero.tagline }}</p>

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
              <ol class="ab-timeline">
                <li
                  v-for="item in milestones.items"
                  :key="item.date"
                  class="ab-reveal"
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
                v-for="card in knowledge.cards"
                :key="card.title"
                :to="card.link"
                class="ab-card ab-reveal"
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
                >{{ section.cta.text }} <span aria-hidden="true">→</span></RouteLink
              >

              <ul v-if="section.stats?.length" class="ab-stats">
                <li v-for="stat in section.stats" :key="stat.value" class="ab-reveal">
                  <span class="ab-stat-value">{{ stat.value }}</span>
                  <span class="ab-stat-label">{{ stat.label }}</span>
                </li>
              </ul>

              <ul v-if="section.features?.length" class="ab-features">
                <li
                  v-for="feature in section.features"
                  :key="feature.title"
                  class="ab-reveal"
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
@use "../styles/space-home";
</style>
