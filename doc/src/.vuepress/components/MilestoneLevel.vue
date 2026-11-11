<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import PixelMascot from "./PixelMascot.vue";

// Kamienie milowe jako plansza platformówki. Każdy kamień milowy to platforma (kolejna
// wyżej od poprzedniej), z blokiem nad nią i tabliczką z opisem w „ziemi”.
// Maskotka przechodzi planszę w rytm przewijania strony; tabliczki są widoczne zawsze,
// animacja tylko je podświetla. Bez JS i przy prefers-reduced-motion plansza jest
// od razu „ukończona”.
interface Milestone {
  date: string;
  text: string;
}

const props = defineProps<{
  items: Milestone[];
  image?: string;
  // id sekcji; link do niej (np. z menu w hero) uruchamia automatyczny przebieg planszy
  anchor?: string;
}>();

// geometria planszy (px, liczone od góry „nieba”)
const FIRST_TOP = 290; // górna krawędź pierwszej platformy
const MAX_RISE = 152; // o ile wyżej może stać ostatnia platforma
const MASCOT_JUMP = 70; // wysokość łuku skoku
const RUN = 0.25; // część odcinka na rozbieg po platformie
const LAND = 0.85; // koniec lotu

const count = computed(() => props.items.length);
const step = computed(() => (count.value > 1 ? Math.min(38, MAX_RISE / (count.value - 1)) : 0));
const centerPct = (i: number): number => ((i + 0.5) / count.value) * 100;
const platformTop = (i: number): number => FIRST_TOP - i * step.value;

const years = computed(() => {
  const year = (m?: Milestone): string => m?.date.split(".").pop() ?? "";
  return `${year(props.items[0])} → ${year(props.items.at(-1))}`;
});

// postęp 0…1 przejścia planszy; start na 1 = stan ukończony (SSR, bez JS, reduced motion)
const progress = ref(1);
const live = ref(false);

const mascot = computed(() => {
  const n = count.value;
  if (n < 2) return { pct: centerPct(0), px: 0, top: platformTop(0), air: false, reached: n - 1 };
  const s = progress.value * (n - 1);
  const i = Math.min(Math.floor(s), n - 2);
  const f = s - i;
  if (f < RUN) {
    return { pct: centerPct(i), px: (f / RUN) * 30, top: platformTop(i), air: false, reached: i };
  }
  if (f < LAND) {
    const k = (f - RUN) / (LAND - RUN);
    return {
      pct: centerPct(i) + (centerPct(i + 1) - centerPct(i)) * k,
      px: 30 - 70 * k,
      top: platformTop(i) + (platformTop(i + 1) - platformTop(i)) * k - MASCOT_JUMP * 4 * k * (1 - k),
      air: true,
      reached: i,
    };
  }
  return {
    pct: centerPct(i + 1),
    px: -40 + ((f - LAND) / (1 - LAND)) * 40,
    top: platformTop(i + 1),
    air: false,
    reached: i + 1,
  };
});

const stepFrame = computed(() => Math.floor(progress.value * 160) % 2 === 1);
const score = computed(() => mascot.value.reached + 1);

const scroller = ref<HTMLElement | null>(null);
const level = ref<HTMLElement | null>(null);
let frame = 0;

// na wąskim ekranie plansza przewija się w bok tak, żeby maskotka była na środku
const pan = (): void => {
  const el = level.value;
  const box = scroller.value;
  if (!el || !box || box.scrollWidth <= box.clientWidth) return;
  const x = (mascot.value.pct / 100) * el.scrollWidth + mascot.value.px;
  box.scrollLeft = x - box.clientWidth / 2;
};

// Automatyczny przebieg (po wejściu z linku): skok do sekcji kładzie planszę u góry
// ekranu, co przy sterowaniu przewijaniem oznaczałoby od razu metę. Maskotka staje więc
// na starcie i sama biegnie do flagi; ruch użytkownika (kółko, dotyk, klawisz) przerywa
// przebieg i oddaje sterowanie przewijaniu.
const PLAY_DELAY = 450; // ms, aż skończy się przewinięcie do sekcji
const PLAY_DURATION = 4500;
let playFrame = 0;
let playing = false;

const stopPlay = (): void => {
  if (!playing) return;
  playing = false;
  cancelAnimationFrame(playFrame);
  for (const type of ["wheel", "touchstart", "keydown"]) window.removeEventListener(type, stopPlay);
  schedule();
};
const play = (): void => {
  stopPlay();
  playing = true;
  progress.value = 0;
  pan();
  for (const type of ["wheel", "touchstart", "keydown"])
    window.addEventListener(type, stopPlay, { passive: true });
  const start = performance.now() + PLAY_DELAY;
  const tick = (now: number): void => {
    if (!playing) return;
    progress.value = Math.min(1, Math.max(0, (now - start) / PLAY_DURATION));
    pan();
    if (progress.value < 1) playFrame = requestAnimationFrame(tick);
    else stopPlay();
  };
  playFrame = requestAnimationFrame(tick);
};

// plansza zaczyna się, gdy jej góra jest na 80% wysokości okna, kończy na 20%
const update = (): void => {
  frame = 0;
  const el = level.value;
  if (!el || playing) return;
  const vh = window.innerHeight;
  const top = el.getBoundingClientRect().top;
  progress.value = Math.min(1, Math.max(0, (0.8 * vh - top) / (0.6 * vh)));
  pan();
};
const schedule = (): void => {
  if (!frame) frame = requestAnimationFrame(update);
};

// kliknięcie dowolnego linku do sekcji (także ponowne, gdy hash się nie zmienia)
const onLinkClick = (event: MouseEvent): void => {
  if (!props.anchor) return;
  const link = (event.target as Element | null)?.closest?.("a");
  if (link?.getAttribute("href") === `#${props.anchor}`) play();
};

onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  live.value = true;
  update();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
  document.addEventListener("click", onLinkClick);
  if (props.anchor && decodeURIComponent(location.hash) === `#${props.anchor}`) play();
});
onBeforeUnmount(() => {
  stopPlay();
  cancelAnimationFrame(frame);
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  document.removeEventListener("click", onLinkClick);
});
</script>

<template>
  <div class="ab-level-frame" :class="{ 'is-live': live }">
    <div ref="scroller" class="ab-level-scroll">
      <div ref="level" class="ab-level">
        <div class="ab-level-sky" aria-hidden="true">
          <div
            v-if="image"
            class="ab-level-art"
            :style="{ backgroundImage: `url(${image})` }"
          />
          <div class="ab-level-hud">
            <span>World <b>Homelab</b></span>
            <span>{{ years }}</span>
            <span>Score <b>{{ score }}/{{ count }}</b></span>
          </div>

          <template v-for="(item, i) in items" :key="item.date">
            <div
              class="ab-level-block"
              :class="{ 'is-used': i <= mascot.reached }"
              :style="{ left: `${centerPct(i)}%`, top: `${platformTop(i) - 92}px` }"
            >
              ?
            </div>
            <div
              class="ab-level-plus"
              :class="{ 'is-used': i <= mascot.reached }"
              :style="{ left: `${centerPct(i)}%`, top: `${platformTop(i) - 112}px` }"
            >
              +1
            </div>
            <div
              class="ab-level-platform"
              :style="{ left: `${centerPct(i)}%`, top: `${platformTop(i)}px` }"
            />
          </template>

          <div
            class="ab-level-flag"
            :style="{ left: `${centerPct(count - 1)}%`, top: `${platformTop(count - 1) - 92}px` }"
          />

          <div
            class="ab-level-mascot"
            :class="{ 'is-air': mascot.air, 'is-step': !mascot.air && stepFrame }"
            :style="{ left: `calc(${mascot.pct}% + ${mascot.px}px)`, top: `${mascot.top}px` }"
          >
            <PixelMascot />
          </div>
        </div>

        <ol class="ab-level-ground">
          <li
            v-for="(item, i) in items"
            :key="item.date"
            class="ab-level-sign"
            :class="{ 'is-hit': i <= mascot.reached }"
          >
            <time>{{ item.date }}</time>
            <span>{{ item.text }}</span>
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>
