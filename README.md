# Resonance Codex Companion

A dependency-free, single-file companion build for the TechnoBioFascia / ARBP research constellation.

This package contains **MVP 1: Resonance Companion Core**: a mobile-first practice, sound, Codex, journaling, and ARBP experiment-notebook interface.

## Live file

Open `index.html` directly in a browser, or publish the repo with GitHub Pages.

## What this build includes

- **Today dashboard**: real-time clock, solar phase, moon phase, sun sign, planetary-hour approximation, frequency prescription, body focus, and practice gate.
- **Session builder**: 10, 15, or 25 minute three-phase practice timer: Calibrate, Activate, Integrate.
- **Tone engine**: Web Audio API sine-wave generator for the prescribed frequency or custom frequencies.
- **Body focus map**: simple tappable silhouette with linked Codex entries and practice gates.
- **Living Codex browser**: embedded entries 001-006.
- **Sound Lab**: frequency cards with evidence labels and quick play controls.
- **Aqua Lab / ARBP Notebook**: structured experiment logging for control/treatment samples, water volume, container, frequency, vocal input, duration, and observations.
- **Journal + streaks**: localStorage-backed practice logs, streak calculation, session history, JSON export.
- **Evidence boundaries**: badges separate biophysical, practice-based, traditional, contested, and experimental claims.

## Evidence and safety boundary

This app is a **practice, reflection, and experimental notebook**. It is not a medical device, diagnostic tool, therapy protocol, purification system, or treatment app.

ARBP / Aqua Lab entries are logged as **experimental / personal observation only**. They do not prove causality and should not be used for health, safety, or water-quality decisions.

## Architecture

- `index.html`
- Embedded CSS
- Embedded JavaScript
- No build process
- No server
- No external dependencies
- Data saved locally with `localStorage`

## Data stored locally

- `resonance_codex_sessions_v1`
- `resonance_codex_experiments_v1`
- `resonance_codex_settings_v1`

Use the built-in export buttons to download JSON backups.

## Current MVP limitations

This version is intentionally the first stable companion shell. Missing sections are tracked in the repository roadmap issue.

Most important missing areas:

1. Full layered fascia / meridian / receptor body map.
2. Expanded Codex entries beyond 001-006.
3. Full Unified Frequency Library import and filtering.
4. CSV export and structured before/after fields for Aqua Lab.
5. JSON import / restore for sessions and experiments.
6. PWA shell, manifest, service worker, and GitHub Pages workflow.
7. Optional microphone-based vocal analysis.
8. Companion intelligence and trend-based recommendations.

## Next build targets

1. Add full interactive layered body map.
2. Expand Codex entries 007-010.
3. Add CSV export for Aqua Lab.
4. Add import/restore for session and experiment JSON.
5. Add optional microphone-based vocal analysis.
6. Add GitHub Pages deployment workflow.
