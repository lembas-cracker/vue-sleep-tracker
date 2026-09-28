<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const naps = ref([]);
const loading = ref(true);

const loadNaps = () => {
  const data = JSON.parse(localStorage.getItem("naps") || "[]");
  naps.value = data ? data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) : [];
  loading.value = false;
};

const duration = (start, end) => {
  if (!start || !end) return "—";
  const diff = new Date(end) - new Date(start);
  if (isNaN(diff) || diff <= 0) return "—";
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr ${remainingMinutes} min`;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

onMounted(() => {
  loadNaps();
  window.addEventListener("naps-updated", loadNaps);
});

onUnmounted(() => {
  window.removeEventListener("naps-updated", loadNaps);
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="flex items-center gap-2 text-base sm:text-xl font-bold text-slate-800 dark:text-slate-100">
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
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </span>
        Nap Logs
      </h2>
    </div>

    <!-- loading skeleton -->
    <div
      v-if="loading"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div class="border-b border-slate-200 bg-slate-100/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
        <div class="flex gap-4">
          <div class="h-3 w-16 animate-pulse rounded bg-slate-300/60 dark:bg-slate-600/60"></div>
          <div class="h-3 w-20 animate-pulse rounded bg-slate-300/60 dark:bg-slate-600/60"></div>
          <div class="h-3 w-20 animate-pulse rounded bg-slate-300/60 dark:bg-slate-600/60"></div>
          <div class="h-3 w-24 animate-pulse rounded bg-slate-300/60 dark:bg-slate-600/60"></div>
          <div class="h-3 w-16 animate-pulse rounded bg-slate-300/60 dark:bg-slate-600/60"></div>
        </div>
      </div>
      <div class="divide-y divide-slate-100 dark:divide-slate-700/60">
        <div v-for="n in 3" :key="n" class="flex items-center gap-4 px-4 py-4">
          <div class="h-6 w-20 animate-pulse rounded-full bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div class="h-3 w-28 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div class="h-3 w-28 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div class="h-3 w-20 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
          <div class="h-3 w-16 animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/60"></div>
        </div>
      </div>
    </div>

    <!-- if no naps -->
    <div
      v-else-if="naps.length === 0"
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white/40 py-12 dark:border-slate-700 dark:bg-slate-900/30"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-500/20 dark:to-purple-500/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="h-6 w-6 text-indigo-500 dark:text-indigo-400"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-500 dark:text-slate-400">No naps logged yet</p>
      <p class="text-xs text-slate-400 dark:text-slate-500">Add your first nap using the form</p>
    </div>

    <!-- table -->
    <div
      v-else
      class="overflow-hidden rounded-xl border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-slate-900/40"
    >
      <div class="overflow-x-auto overflow-y-auto max-h-[28rem] table-scroll">
        <table class="min-w-full text-left text-sm">
          <thead
            class="sticky top-0 z-10 border-b border-slate-200 bg-slate-100 text-xs uppercase tracking-wider text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
          >
            <tr>
              <th class="px-4 py-3 font-semibold">Twin</th>
              <th class="px-4 py-3 font-semibold">Start</th>
              <th class="px-4 py-3 font-semibold">End</th>
              <th class="px-4 py-3 font-semibold">Duration</th>
              <th class="px-4 py-3 font-semibold">Notes</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/60">
            <tr
              v-for="(nap, i) in naps"
              :key="nap.id"
              class="group transition-colors duration-200 hover:bg-gradient-to-r hover:from-indigo-50/60 hover:to-pink-50/60 dark:hover:from-indigo-500/10 dark:hover:to-pink-500/10"
              :style="{ animation: `fadeUp 0.4s ease-out ${i * 40}ms both` }"
            >
              <td class="px-4 py-3">
                <span
                  :class="
                    nap.twin === 'A'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/30'
                      : 'bg-gradient-to-r from-pink-500 to-fuchsia-500 shadow-pink-500/30'
                  "
                  class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-white/90"></span>
                  Twin {{ nap.twin }}
                </span>
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                {{ formatDate(nap.startTime) }}
              </td>

              <td class="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-200">
                {{ formatDate(nap.endTime) }}
              </td>

              <td class="whitespace-nowrap px-4 py-3">
                <span class="font-semibold text-slate-800 dark:text-slate-100">
                  {{ duration(nap.startTime, nap.endTime) }}
                </span>
              </td>

              <td class="px-4 py-3 text-slate-600 dark:text-slate-400">
                {{ nap.notes || "—" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
