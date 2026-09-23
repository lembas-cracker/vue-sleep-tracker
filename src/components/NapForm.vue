<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";
import flatpickr from "flatpickr";
import "flatpickr/dist/themes/dark.css";

const twin = ref("A");
const startTime = ref(null);
const endTime = ref(null);
const notes = ref("");

const startInputRef = ref(null);
const endInputRef = ref(null);

let startPicker = null;
let endPicker = null;

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

  if (!startTime.value || !endTime.value) {
    return;
  }

  if (new Date(endTime.value) <= new Date(startTime.value)) {
    return;
  }

  const nap = {
    id: Date.now(),
    twin: twin.value,
    startTime: startTime.value,
    endTime: endTime.value,
    notes: notes.value,
  };
  saveNap(nap);
  window.dispatchEvent(new Event("naps-updated"));
  twin.value = "A";
  startTime.value = null;
  endTime.value = null;
  notes.value = "";

  startPicker?.clear();
  endPicker?.clear();
};

const flatpickrConfig = (onChange) => ({
  enableTime: true,
  time_24hr: true,
  dateFormat: "M d, Y H:i",
  altInput: true,
  altFormat: "M d, Y · h:i K",
  allowInput: false,
  disableMobile: true,
  minuteIncrement: 5,
  onChange: (selectedDates) => {
    onChange(selectedDates[0] || null);
  },
});

onMounted(() => {
  startPicker = flatpickr(startInputRef.value, {
    ...flatpickrConfig((date) => {
      startTime.value = date;
      if (date && endPicker) {
        const currentEnd = endPicker.selectedDates[0];
        if (!currentEnd || currentEnd <= date) {
          endPicker.setDate(date, true);
        }
      }
    }),
  });

  endPicker = flatpickr(endInputRef.value, {
    ...flatpickrConfig((date) => {
      endTime.value = date;
    }),
    minDate: startTime.value || undefined,
  });
});

onUnmounted(() => {
  startPicker?.destroy();
  endPicker?.destroy();
});

watch(startTime, (value) => {
  if (!endPicker) return;
  endPicker.set("minDate", value || undefined);
});
</script>

<template>
  <form @submit="addNap" class="space-y-5">
    <div>
      <span class="mb-2 block text-sm font-medium text-gray-200">Twin</span>
      <div class="relative grid grid-cols-2 gap-1 rounded-xl text-slate-900 border border-slate-700 p-1">
        <span
          class="absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-lg bg-slate-700 shadow-sm transition-transform duration-300 ease-out"
          :style="{
            transform: twin === 'A' ? 'translateX(0)' : 'translateX(calc(100% + 0.25rem))',
          }"
          aria-hidden="true"
        />
        <button
          type="button"
          @click="twin = 'A'"
          :class="twin === 'A' ? 'text-blue-500' : 'text-gray-200'"
          class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
          :aria-pressed="twin === 'A'"
        >
          Twin A
        </button>
        <button
          type="button"
          @click="twin = 'B'"
          :class="twin === 'B' ? 'text-pink-500' : 'text-gray-200'"
          class="relative z-10 rounded-lg py-2 text-sm font-bold transition-colors"
          :aria-pressed="twin === 'B'"
        >
          Twin B
        </button>
      </div>
    </div>

    <!-- start time -->
    <div class="flex flex-col">
      <label for="start" class="mb-1 block text-sm font-medium text-gray-200"> Start Time </label>
      <input
        ref="startInputRef"
        id="start"
        type="text"
        placeholder="Select start time of the nap"
        class="nap-input w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/20"
      />
    </div>

    <!-- end time -->
    <div class="flex flex-col">
      <label for="end" class="mb-1 block text-sm font-medium text-gray-200"> End Time </label>
      <input
        ref="endInputRef"
        id="end"
        type="text"
        placeholder="Select end time of the nap"
        class="nap-input w-full rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 placeholder:text-gray-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100/20"
      />
    </div>

    <!-- notes -->
    <div class="flex flex-col">
      <label for="notes" class="mb-1 block text-sm font-medium text-gray-200"> Notes </label>
      <input
        type="text"
        id="notes"
        v-model="notes"
        placeholder="Optional"
        class="w-full rounded-lg text-slate-200 border border-slate-700 px-3 py-2 text-sm placeholder:text-gray-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-100/15"
      />
    </div>

    <!-- add nap button -->
    <button
      type="submit"
      :disabled="!startTime || !endTime"
      class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-gray-200 shadow-lg shadow-blue-500/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/50 active:translate-y-0 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-blue-500/30"
    >
      <span class="relative z-10">Add Nap</span>
      <span
        class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        aria-hidden="true"
      />
    </button>
  </form>
</template>
