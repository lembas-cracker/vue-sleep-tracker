<script setup>
import { ref } from "vue";

const twin = ref("A");
const startTime = ref("");
const endTime = ref("");
const notes = ref("");

const loadNaps = () => {
  const naps = JSON.parse(localStorage.getItem("naps") || "[]");
  return naps;
};

const saveNap = (nap) => {
  const naps = loadNaps();
  naps.push(nap);
  localStorage.setItem("naps", JSON.stringify(naps));
};

const addNap = (e) => {
  e.preventDefault();
  const nap = {
    id: Date.now(),
    twin: twin.value,
    startTime: startTime.value,
    endTime: endTime.value,
    notes: notes.value,
  };
  saveNap(nap);
  // Clear form
  twin.value = "A";
  startTime.value = "";
  endTime.value = "";
  notes.value = "";
};
</script>

<template>
  <form @submit="addNap" class="bg-white p-6 rounded-xl shadow-md space-y-4">
    <div class="flex flex-col">
      <label class="mb-1 font-medium text-gray-700">Twin</label>
      <select
        v-model="twin"
        class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="A">Twin A</option>
        <option value="B">Twin B</option>
      </select>
    </div>

    <div class="flex flex-col">
      <label for="start" class="mb-1 font-medium text-gray-700">Start Time</label>
      <input
        type="datetime-local"
        id="start"
        v-model="startTime"
        required
        class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <div class="flex flex-col">
      <label for="end" class="mb-1 font-medium text-gray-700">End Time</label>
      <input
        type="datetime-local"
        id="end"
        v-model="endTime"
        required
        class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <div class="flex flex-col">
      <label for="notes" class="mb-1 font-medium text-gray-700">Notes</label>
      <input
        type="text"
        id="notes"
        v-model="notes"
        placeholder="Optional"
        class="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>

    <button
      type="submit"
      class="w-full bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200"
    >
      Add Nap
    </button>
  </form>
</template>
