<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
import AnalysisModal from "./AnalysisModal.vue";
import SleepAnalysis from "./SleepAnalysis.vue";

Chart.register(...registerables);

const chartRef = ref(null);
const loading = ref(true);
const naps = ref([]);
const modalOpen = ref(false);
let chartInstance = null;

const canAnalyze = computed(() => {
  const a = naps.value.filter((n) => n.twin === "A").length;
  const b = naps.value.filter((n) => n.twin === "B").length;
  // if at least 2 naps for A only, or 2 for B only, or 1 nap each
  return (a >= 1 && b >= 1) || a >= 2 || b >= 2;
});

const loadChart = () => {
  const data = JSON.parse(localStorage.getItem("naps") || "[]");
  naps.value = data;

  const summary = {};
  data.forEach((nap) => {
    const day = new Date(nap.startTime).toLocaleDateString();
    if (!summary[day]) summary[day] = { A: 0, B: 0 };
    summary[day][nap.twin] += (new Date(nap.endTime) - new Date(nap.startTime)) / 3600000;
  });

  const labels = Object.keys(summary).sort();
  const twinA = labels.map((day) => summary[day].A);
  const twinB = labels.map((day) => summary[day].B);

  if (chartInstance) chartInstance.destroy();

  const ctx = chartRef.value.getContext("2d");
  const gradA = ctx.createLinearGradient(0, 0, 0, 300);
  gradA.addColorStop(0, "rgba(59, 130, 246, 0.95)");
  gradA.addColorStop(1, "rgba(99, 102, 241, 0.55)");

  const gradB = ctx.createLinearGradient(0, 0, 0, 300);
  gradB.addColorStop(0, "rgba(244, 114, 182, 0.95)");
  gradB.addColorStop(1, "rgba(236, 72, 153, 0.55)");

  chartInstance = new Chart(chartRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Twin A",
          data: twinA,
          backgroundColor: gradA,
          borderColor: "#2563eb",
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          hoverBackgroundColor: "rgba(59, 130, 246, 1)",
        },
        {
          label: "Twin B",
          data: twinB,
          backgroundColor: gradB,
          borderColor: "#db2777",
          borderWidth: 2,
          borderRadius: 4,
          borderSkipped: false,
          hoverBackgroundColor: "rgba(236, 72, 153, 1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { color: "#e5e7eb", font: { size: 14 } } },
        tooltip: {
          mode: "index",
          intersect: false,
          titleColor: "#e5e7eb",
          bodyColor: "#e5e7eb",
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}h`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Hours", color: "#e5e7eb" },
          ticks: { color: "#e5e7eb" },
          grid: { color: "rgba(229, 231, 235, 0.10)" },
        },
        x: {
          grid: { color: "rgba(229, 231, 235, 0.10)" },
          ticks: { color: "#e5e7eb", font: { size: 11 } },
        },
      },
    },
  });
  loading.value = false;
};

onMounted(() => {
  loadChart();
  window.addEventListener("naps-updated", loadChart);
});

onUnmounted(() => {
  window.removeEventListener("naps-updated", loadChart);
  if (chartInstance) chartInstance.destroy();
});
</script>

<template>
  <div class="w-full">
    <div class="mb-5 sm:mb-2 flex items-center justify-between gap-4">
      <h2 class="text-base font-bold text-gray-200 sm:text-xl">Daily Nap Summary</h2>

      <button
        type="button"
        @click="modalOpen = true"
        :disabled="!canAnalyze"
        class="group relative cursor-pointer overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1.5 text-xs md:text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-indigo-500/50 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-indigo-500/30"
      >
        <span class="relative z-10 flex items-center gap-1.5">
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
          Analyze
        </span>
        <span
          class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
          aria-hidden="true"
        />
      </button>
    </div>

    <div class="relative h-64 w-full sm:h-80 lg:h-96">
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center"></div>
      <canvas ref="chartRef" :class="{ invisible: loading }"></canvas>
    </div>

    <!-- modal -->
    <AnalysisModal :open="modalOpen" @close="modalOpen = false">
      <SleepAnalysis :auto-run="true" />
    </AnalysisModal>
  </div>
</template>
