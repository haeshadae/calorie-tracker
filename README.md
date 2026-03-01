# calorie-tracker
# 🌸 Bloom — Personal Calorie Tracker
A web app that uses AI to estimate calories from natural language food entries and tracks your daily intake against a personalized calorie target — no barcode scanning, no food database, just type what you ate. Includes a trend feature to see intake levels over time

---

## ✨ What It Does

1. **Onboarding** — enter your name, gender, height, weight, age, and activity level
2. **Mifflin-St Jeor equation** calculates your BMR and adjusts for activity level to give you your personal daily calorie target (TDEE)
3. **Natural language logging** — type "two eggs, toast, and a coffee" and Claude identifies each item and estimates calories
4. **Daily tracking** — log by meal, edit or delete entries, totals recalculate automatically
5. **7-day trends chart** — visualize your intake vs. your target over time

Result:
A clean, AI-powered calorie tracker that feels as simple as texting.

---

## 🧠 Why I Built This

I wanted to explore building a full consumer-facing web app using Claude Code — from scaffolding the project to deploying on Netlify. Bloom was a way to learn the end-to-end workflow while building something that I would actually use.

---

## ⚙️ Architecture

User Input → Anthropic API → Calorie Estimate → localStorage → Dashboard + Trends Chart

---

## 📁 Repository Structure

- `/src` — React components and app logic
- `/netlify/functions` — serverless function that calls the Anthropic API
- `/public` — static assets

---

## 🔒 Security

No API keys or personal data are stored in this repository. The Anthropic API key is stored locally in a `.env` file and injected server-side via Netlify Functions.

---

Built using Claude Code.

---
