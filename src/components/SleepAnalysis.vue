<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h2 class="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
        <span
          class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm"
          aria-hidden="true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-3.5 w-3.5"
          >
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
            <circle cx="12" cy="12" r="4" />
          </svg>
        </span>
        AI Sleep Analysis
      </h2>

      <div class="flex flex-wrap gap-2">
        <button
          @click="analyzeSleep"
          :disabled="loading"
          class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/50 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-blue-500/30"
        >
          <span class="relative z-10">{{ loading ? "Analyzing…" : "Weekly Analysis" }}</span>
          <span
            class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden="true"
          />
        </button>

        <button
          @click="reviewToday"
          :disabled="loading"
          class="group relative overflow-hidden rounded-lg bg-gradient-to-r from-pink-500 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-pink-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pink-500/50 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-pink-500/30"
        >
          <span class="relative z-10">{{ loading ? "Analyzing…" : "Review Today" }}</span>
          <span
            class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- Disclaimer -->
    <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
      Pattern-based guidance. Not medical advice. Always consult a healthcare professional for sleep issues.
    </p>

    <!-- Error -->
    <div
      v-if="error"
      class="rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-sm text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400"
    >
      {{ error }}
    </div>

    <!-- Results -->
    <div v-if="coachResult" class="space-y-3">
      <div
        v-for="(value, key) in coachResult"
        :key="key"
        class="rounded-xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/40"
      >
        <h3 class="text-base font-semibold capitalize text-slate-800 dark:text-slate-100">
          {{ formatTitle(key) }}
        </h3>

        <ul
          v-if="Array.isArray(value)"
          class="mt-2 list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-300"
        >
          <li v-for="(item, index) in value" :key="index">{{ item }}</li>
        </ul>

        <p v-else class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const loading = ref(false);
const coachResult = ref(null);
const error = ref(null);

const SYSTEM_PROMPT = `You are a practical pediatric sleep coach. You analyse structured sleep metrics and provide short, actionable, supportive guidance. DO NOT provide medical advice. Do NOT diagnose conditions. Keep responses under 200 words. Return ONLY valid JSON in this exact structure:
{
"overall_summary":"",
"twinA_insight":"",
"twinB_insight":"",
"overlap_advice":"",
"actionable_steps":[]
}
`;

function loadNaps() {
  return JSON.parse(localStorage.getItem("naps") || "[]");
}

function minutesBetween(start, end) {
  return (new Date(end) - new Date(start)) / 60000;
}

function calculateMetrics() {
  const naps = loadNaps();
  if (!naps.length) return null;

  const twinA = naps.filter((n) => n.twin === "A");
  const twinB = naps.filter((n) => n.twin === "B");

  function analyzeTwin(twinNaps) {
    if (!twinNaps.length) {
      return {
        avg_nap_minutes: 0,
        short_nap_count: 0,
        long_nap_count: 0,
        total_minutes: 0,
      };
    }

    const durations = twinNaps.map((n) => minutesBetween(n.startTime, n.endTime));

    const total = durations.reduce((a, b) => a + b, 0);
    const avg = total / durations.length;

    return {
      avg_nap_minutes: Math.round(avg),
      short_nap_count: durations.filter((d) => d < 30).length,
      long_nap_count: durations.filter((d) => d >= 30).length,
      total_minutes: Math.round(total),
    };
  }

  function calculateOverlap() {
    let overlapMinutes = 0;

    for (const a of twinA) {
      for (const b of twinB) {
        const start = new Date(Math.max(new Date(a.startTime), new Date(b.startTime)));
        const end = new Date(Math.min(new Date(a.endTime), new Date(b.endTime)));

        if (end > start) {
          overlapMinutes += minutesBetween(start, end);
        }
      }
    }

    const totalA = twinA.reduce((sum, nap) => sum + minutesBetween(nap.startTime, nap.endTime), 0);

    if (!totalA) return 0;
    return Math.round((overlapMinutes / totalA) * 100);
  }

  return {
    days_analyzed: 7,
    twinA: analyzeTwin(twinA),
    twinB: analyzeTwin(twinB),
    overlap_percentage: calculateOverlap(),
  };
}

async function analyzeSleep() {
  loading.value = true;
  error.value = null;
  coachResult.value = null;

  try {
    const metrics = calculateMetrics();

    if (!metrics) {
      error.value = "No nap data found. Please log naps to get insights.";
      return;
    }

    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metrics }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Analysis failed");
    }

    // The content from DeepSeek is a JSON string; parse it for your template
    coachResult.value = JSON.parse(data.content);
  } catch (err) {
    console.error(err);
    error.value = "Failed to analyze sleep data. Please try again.";
  } finally {
    loading.value = false;
  }
}

// Optional helpers used in template
function formatTitle(key) {
  return key.replace(/_/g, " ");
}

function reviewToday() {
  error.value = "Today's review not implemented yet.";
}
</script>
