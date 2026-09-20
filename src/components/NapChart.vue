<template>
  <div class="w-full">
    <h2 class="text-xl font-bold mb-2">Daily Nap Summary</h2>
    <div class="relative h-64 w-full sm:h-80 lg:h-96">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = null;

const loadChart = () => {
  const data = JSON.parse(localStorage.getItem("naps") || "[]");

  const summary = {};
  data.forEach((nap) => {
    const day = new Date(nap.start_time).toLocaleDateString();
    if (!summary[day]) summary[day] = { A: 0, B: 0 };
    summary[day][nap.twin] += (new Date(nap.end_time) - new Date(nap.start_time)) / 3600000;
  });

  const labels = Object.keys(summary).sort();
  const twinA = labels.map((day) => summary[day].A);
  const twinB = labels.map((day) => summary[day].B);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(chartRef.value, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Twin A",
          data: twinA,
          backgroundColor: "linear-gradient(90deg, #4ade80, #22c55e)", // green gradient
          borderColor: "#16a34a",
          borderWidth: 2,
        },
        {
          label: "Twin B",
          data: twinB,
          backgroundColor: "linear-gradient(90deg, #f472b6, #ec4899)", // pink gradient
          borderColor: "#db2777",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top", labels: { font: { size: 14 } } },
        tooltip: { mode: "index", intersect: false },
      },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Hours" } },
      },
    },
  });
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
