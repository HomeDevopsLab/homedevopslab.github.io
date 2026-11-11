<script setup lang="ts">
// Pikselowa maskotka Angrybits (zdenerwowany procesor), 12×13 pikseli.
// Kolory z tokenów --ab-spr-* (klasy .ab-px-*), dwie klatki nóg do animacji biegu:
// rodzic dokłada .is-step (druga klatka) albo .is-air (skok, bez nóg).
const BODY = [
  "..p.p..p.p..",
  ".oooooooooo.",
  "pobbbbbbbbop",
  ".obdbbbbdbo.",
  "pobbdbbdbbop",
  ".obbbbbbbbo.",
  "pobbdbbdbbop",
  ".obbbbbbbbo.",
  "pobbddddbbop",
  ".obdbbbbdbo.",
  ".oooooooooo.",
];
const LEGS_A = ["..l......l..", ".l........l."];
const LEGS_B = ["...l....l...", "...l....l..."];

interface Pixel {
  x: number;
  y: number;
  c: string;
}

const toPixels = (rows: string[], y0: number): Pixel[] =>
  rows.flatMap((row, y) =>
    [...row].flatMap((c, x) => (c === "." ? [] : [{ x, y: y + y0, c }])),
  );

const body = toPixels(BODY, 0);
const legsA = toPixels(LEGS_A, BODY.length);
const legsB = toPixels(LEGS_B, BODY.length);
</script>

<template>
  <svg class="ab-mascot" viewBox="0 0 12 13" aria-hidden="true" focusable="false">
    <rect v-for="p in body" :key="`b${p.x}-${p.y}`" :class="`ab-px-${p.c}`" :x="p.x" :y="p.y" width="1" height="1" />
    <g class="ab-mascot-legs-a">
      <rect v-for="p in legsA" :key="`a${p.x}-${p.y}`" :class="`ab-px-${p.c}`" :x="p.x" :y="p.y" width="1" height="1" />
    </g>
    <g class="ab-mascot-legs-b">
      <rect v-for="p in legsB" :key="`l${p.x}-${p.y}`" :class="`ab-px-${p.c}`" :x="p.x" :y="p.y" width="1" height="1" />
    </g>
  </svg>
</template>
