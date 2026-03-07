# Entropy Override — Tactics Codex v4.0

BlazBlue Entropy Effect X companion app. Real damage values from the BlazBlue Wiki and Steam community data.

## Features
- **Build Analyzer** — 5 characters × 3 builds each, with real tactic math and DPS breakdown charts
- **Tactics Database** — 15 tactics with rarity scaling charts (Common → Legendary damage values)
- **Radar profiles** per build (Burst / Sustain / AoE / Control / Survival)

## Deploy to Vercel (one command)
```bash
npm install -g vercel
vercel --prod
```

## Local dev
```bash
npm install
npm run dev
```

## Data sources
- Damage numbers: https://blazblue.wiki/wiki/BlazBlue_Entropy_Effect/Tactics
- Tier reasoning: Steam Community discussions (2024-2025)
- Patch notes: Steam store news (Nov 2024 balance patch)
