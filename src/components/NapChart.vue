<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-2 text-gray-200">Daily Nap Summary</h2>
    <div class="relative h-64 w-full sm:h-80 lg:h-96">
      <!-- loading spinner -->
      <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
        <div class="relative h-48 w-48">
          <div
            class="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 border-r-indigo-400/40 animate-spin"
            style="animation-duration: 2.4s"
          ></div>
          <div
            class="absolute inset-4 rounded-full border-4 border-transparent border-b-purple-400 border-l-purple-400/40 animate-spin"
            style="animation-duration: 1.8s; animation-direction: reverse"
          ></div>
          <div
            class="absolute inset-8 rounded-full border-4 border-transparent border-t-pink-400 border-r-pink-400/40 animate-spin"
            style="animation-duration: 1.2s"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40 animate-pulse"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="h-7 w-7 text-white"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <canvas ref="chartRef" :class="{ invisible: loading }"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const chartRef = ref(null);
const loading = ref(true);
let chartInstance = null;

const loadChart = () => {
  const data = JSON.parse(localStorage.getItem("naps") || "[]");

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

  // twin A
  const gradA = ctx.createLinearGradient(0, 0, 0, 300);
  gradA.addColorStop(0, "rgba(59, 130, 246, 0.95)");
  gradA.addColorStop(1, "rgba(99, 102, 241, 0.55)");

  // twin B
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
          grid: {
            color: "rgba(229, 231, 235, 0.10)",
          },
        },
        x: {
          grid: {
            color: "rgba(229, 231, 235, 0.10)",
          },
          ticks: {
            color: "#e5e7eb",
            font: { size: 11 },
          },
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
