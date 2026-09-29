# 🌙 SleeperAgent

## 📈 What it does

SleeperAgent helps you log, compare, and understand your twins' sleep patterns in one place. No account, no backend, no nonsense — everything lives in your browser.

+ Log naps in seconds — a segmented toggle for Twin A / Twin B, date-time pickers, optional notes
+ See the daily picture — a bar chart comparing total nap hours per twin, day by day
+ Scroll through history — a clean table of every entry, newest first
+ Ask the AI coach — sends anonymous metrics to an AI model and gets back short, actionable insights for each twin and their overlap
+ Works offline — all data stays in localStorage, no servers, no tracking
+ To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🥞 Stack

+ Astro — static-first framework with islands architecture
+ Vue 3 — for the interactive bits (form, chart, list, analysis modal)
+ Tailwind CSS — for the frosted-glass, indigo-tinted design system
+ Chart.js — the nap comparison chart
+ Flatpickr — date and time pickers
+ DeepSeek — the AI behind the sleep coach
+ Vercel — hosting + serverless API routes

All commands are run from the root of the project, from a terminal:

## 👀 The AI coach

The "AI Analysis" button in the chart header opens a modal that:

+ Computes anonymous metrics from your logged naps (avg duration, short/long nap counts, overlap percentage)
+ Sends only the numbers — no notes, no timestamps, no personal data — to a Vercel serverless function
+ The function forwards them to DeepSeek with a pediatric-sleep-coach system prompt
+ Returns structured JSON that's rendered as cards

The API key lives in Vercel's environment variables, so it's never exposed to the browser. The button is disabled until there's enough data to say something meaningful (at least one nap per twin, or two naps for a single twin).

## Limitations & disclaimers

+ Not medical advice. The AI coach gives pattern-based suggestions, that's it. Talk to a pediatrician for actual sleep concerns.
+ Data lives in your browser. Clearing site data wipes your naps. There's no cloud sync - that's a feature, not a bug.
+ One demo AI key. The hosted demo runs on a small DeepSeek budget. If it says "insufficient balance" that's why. Running locally with your own key always works.

