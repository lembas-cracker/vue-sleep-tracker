<script setup>
import { ref, onMounted } from "vue";

const naps = ref([]);

const loadNaps = () => {
  const data = JSON.parse(localStorage.getItem("naps") || "[]");
  naps.value = data ? data.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) : [];
};

const duration = (start, end) => {
  const diff = new Date(end) - new Date(start);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours} hr ${remainingMinutes} min`;
};

onMounted(() => {
  loadNaps();
});
</script>

<template>
  <div class="space-y-4">
    <h2 class="text-2xl font-bold text-gray-800">Nap Logs</h2>

    <!-- Table Wrapper -->
    <div class="overflow-x-auto rounded-xl shadow-sm border border-gray-200 bg-white">
      <table class="min-w-full text-sm text-left text-gray-700">
        <!-- Table Head -->
        <thead class="bg-slate-100 text-gray-600 uppercase text-xs tracking-wider">
          <tr>
            <th class="px-4 py-3">Twin</th>
            <th class="px-4 py-3">Start</th>
            <th class="px-4 py-3">End</th>
            <th class="px-4 py-3">Duration</th>
            <th class="px-4 py-3">Notes</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-200">
          <tr v-for="nap in naps" :key="nap.id" class="hover:bg-slate-50 transition-colors">
            <td class="px-4 py-3 font-medium text-gray-900">
              <span
                :class="nap.twin === 'A' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'"
                class="px-2 py-1 rounded-full text-xs font-semibold"
              >
                Twin {{ nap.twin }}
              </span>
            </td>

            <td class="px-4 py-3">
              {{ nap.startTime }}
            </td>

            <td class="px-4 py-3">
              {{ nap.endTime }}
            </td>

            <td class="px-4 py-3 font-semibold text-gray-800">
              {{ duration(nap.startTime, nap.endTime) }}
            </td>

            <td class="px-4 py-3 text-gray-600">
              {{ nap.notes || "—" }}
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="naps.length === 0">
            <td colspan="5" class="px-4 py-6 text-center text-gray-500">No naps logged yet.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
