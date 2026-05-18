# symmetrical-goggles

THE_MATRIX - exploring the lightwave

## TECHNOBIOFASCIAL CODEX
This repo’s `README.md` contains the full **TECHNOBIOFASCIAL CODEX — Agent Handoff Document**.

Canonical artifact is intended to be added at `app/codex-v8.jsx`.

JSX validation is available via:
- `npm install`
- `npm run validate:codex-v8` (once `app/codex-v8.jsx` exists)

---

# TECHNOBIOFASCIAL CODEX — Agent Handoff Document


## What this is

A single-file React artifact (`codex-v8.jsx`, ~5000 lines) that runs in the Claude.ai artifact sandbox. It is an interactive training manual for Nicholas Azzara's TECHNOBIOFASCIALUNIFIEDALCHEMY framework — a corpus arguing that specific vocal frequencies, breath rhythms, and phoneme sequences produce measurable effects via bioelectric, piezoelectric, and acoustic mechanisms in the body.

This update extends the dataset to 10 corpus sections, 8 training exercises, and 4 ritual protocols, while preserving the scaffolded runtime and safe placeholder connectors for biometric and AI flows.

The app has no backend. All state persists via `window.storage` (Claude's artifact key-value API). All AI calls go to `api.anthropic.com/v1/messages` directly (the only external origin whitelisted in the sandbox CSP — no other `fetch()` destinations will work).

The working file is `codex-v8.jsx`. Do not rename it. A simplified version `codex-v9.jsx` exists but is a separate experiment — v8 is the primary.

---

## Architecture

### Single file, six tabs

The app renders as a mobile-first single-page app. Six tabs in the bottom NavBar:

| ID | Label | Component |
|----|-------|-----------|
| `dashboard` | NEXUS | `Dashboard` |
| `library` | CODEX | `Library` |
| `frequency` | (icon) | `FrequencyLab` |
| `training` | TRAIN | `Training` |
| `assessment` | ASSESS | `Assessment` |
| `familiar` | FAMILIAR | `FamiliarView` |

### State in App

```js
// App-level state
view          // current tab
profile       // { name, intention }
familiar      // { type, vitality, resonance, coherence, wisdom, lastActive }
progress      // see Progress Schema below
isAdmin       // boolean — unlocks all tiers
pendingEvolution // { stage, familiar } — fires EvolvedNotification overlay
tabStates     // per-tab UI state persisted across nav
```

### Storage keys (`window.storage`)
```
"profile"     → JSON profile object
"familiar"    → JSON familiar object
"progress"    → JSON progress object
"freq_presets"→ JSON array of saved frequency presets
"isAdmin"     → "true"
"lastView"    → last active tab string
"session"     → debounced session snapshot (view + tab state)
```

---

## Data Schemas

### Familiar
```js
{
  type: string,          // one of 7 IDs: "ah","ee","hh","ka","ng","oh","om"
  vitality: number,      // 0–100, decays with inactivity via calcDecay()
  resonance: number,     // 0–100
  coherence: number,     // 0–100
  wisdom: number,        // 0–100
  lastActive: timestamp
}
```
`fieldScore(familiar)` = `V×0.2 + R×0.25 + C×0.3 + W×0.25` (0–100).

Decay: `calcDecay(lastActive)` returns points lost since last save. Applied on load.

### Progress
```js
{
  read: { "sectionId.subId": timestamp, ... },
  exercises: ["exId", ...],              // set — each ID appears once
  sessions: [{                           // full session log, unbounded
    date: timestamp,
    exId: string,
    note: string,
    runId: string | null,
    pre:  { clarity:1-5, calm:1-5, energy:1-5 } | null,
    post: { clarity:1-5, calm:1-5, energy:1-5 } | null,
    duration: seconds | null,            // actual elapsed
    planned:  seconds | null,            // exercise.duration
  }],
  assessments: [{ score, pct, type, date }],
  completedRuns: [{ runId, date }],
  streakData: { activeDates: ["YYYY-MM-DD", ...] },
  statHistory: [{                        // daily familiar snapshot, max 90 days
    date: "YYYY-MM-DD",
    v: number, r: number, c: number, w: number
  }],
}
```

---

## Content: All Sections

### Local sections (always available, body text bundled in JSX)

| ID | Title | Tier | Subsections |
|----|-------|------|-------------|
| `foundations` | I. The Solid Foundation | 1 | `bioelectric`, `piezo`, `quantum_bio`, `zpf` |
| `cascade` | II. The Transduction Cascade | 1 | `chain`, `acoustic_mech` |
| `phonetics` | III. The Phonetic Atlas | 2 | `nasals`, `vowels` |
| `architecture` | IV. Sacred Architecture | 2 | `sites`, `schumann` |
| `experiments` | V. Laboratory Protocols | 3 | `meridian`, `eeg_phoneme` |
| `synthesis` | VI. The Grand Synthesis | 3 | `manual`, `frequency_table` |

### Remote sections (body text also now bundled inline — CDN was abandoned)

| ID | Title | Tier | Subsections |
|----|-------|------|-------------|
| `arbp` | VII. The ARBP Framework | 2 | `premise`, `ancient_code`, `water_medium`, `arbp_equation`, `alchemist_lab`, `digital_grimoire` |
| `consciousness` | VIII. Consciousness Cartography | 1 | `universe_vibration`, `consciousness_field`, `seven_states`, `body_antenna`, `spectrum_model`, `closing_paradox` |
| `keppler` | IX. Quantum Coherence | 3 | `keppler_overview`, `keppler_equations`*, `coherence_domains`*, `thz_problem`, `keppler_experiments` |

*`technical:true` subsections — render `TechnicalBodyDisplay` (CodeBlock Python snippets).

`ALL_SECTIONS = [...LIBRARY_SECTIONS, ...REMOTE_SECTIONS]` — used by Library and Assessment.

Sections VII–IX still have `remote:true` flag but this is cosmetic now. Body text is inline. The CDN/jsDelivr fetch infrastructure was removed entirely — Claude.ai's CSP blocks all non-Anthropic fetch().

---

## Familiar System

### 7 types
| ID | Name | Element | Phoneme target | stat |
|----|------|---------|----------------|------|
| `ah` | Anahata | Heart Field | AH — vagal activation | vitality |
| `ee` | Bindu | Crown Signal | EE — frontal/occipital | wisdom |
| `hh` | Akasha | Field Presence | HH — whispered breath | coherence |
| `ka` | Muladhara | Ground Current | KA — laryngeal base | vitality |
| `ng` | Ajna | Third Eye Resonance | NG — sphenoid/cranial | resonance |
| `oh` | Manipura | Solar Plexus | OH — thoracic depth | coherence |
| `om` | Sahasrara | The Column | OM — full integration | wisdom |

### Evolution gates
Score thresholds for `fieldScore()`:
- 0–17: **Nascent** (no ring)
- 18–37: **Forming** (sky blue ring)
- 38–61: **Established** (violet rotating dashed ring)
- 62+: **Transcendent** (gold pulsing ring + 8 orbiting particles)

Crossings fire `EvolvedNotification` modal (full screen, 7s auto-dismiss). Detected in `save()`.

### FamiliarSigil SVG
Each familiar type has a custom `SigilCenter` geometry — 7 unique SVG shapes hand-crafted per type. The outer rings are live stat arcs: V (rose, r=52), R (violet, r=44), C (emerald, r=36), W (amber, r=28). Evolution rings are added outside at r=58.

---

## Exercises (6 total)

| ID | Title | Tier | Duration | statGain | Biometric |
|----|-------|------|----------|----------|-----------|
| `breath_entrain` | Breath Entrainment | 1 | 5 min | vitality | `BreathCoherenceMeter` |
| `nasal_activate` | Sphenoid Activation | 1 | 3 min | resonance | `MicrophoneAnalyzer` (target: 110 Hz) |
| `body_scan` | Frequency Body Scan | 2 | 7 min | coherence | `MicrophoneAnalyzer` + `TiltBreathViz` |
| `coherence_hold` | Signal Clarity Practice | 2 | 10 min | coherence | `TracingPad` |
| `phoneme_sequence` | Full Phoneme Sequence | 3 | 4 min | resonance | `MicrophoneAnalyzer` (target: 136.1 Hz) |
| `rhythm_ground` | Entrainment Listen | 1 | 3 min | vitality | `TiltBreathViz` |

### Exercise flow
1. Tap exercise → `PreRatingModal` (Clarity/Calm/Energy 1–5 dots)
2. `handlePreDone` starts timer, stores `preState` and `startTimeRef`
3. Active view: progress ring timer → `DynamicStepFlow` (4-step window: prev dim/current bright/next preview/ghost) → `TracingPad` → `BreathCoherenceMeter` → `MicrophoneAnalyzer` → `TiltBreathViz`
4. On timer end: `PostRatingModal` (same 3 sliders) → optional text note
5. `handlePostDone` computes `duration = (Date.now()-startTimeRef.current)/1000`, calls `onComplete(exId, statGain, note, runId, {pre, post, duration, planned})`
6. `handleExercise` in App saves session with full stateData

### Ritual Runs (3 multi-exercise protocols)
| ID | Name | Duration | Exercises |
|----|------|----------|-----------|
| `grounding` | Grounding Protocol | 11 min | rhythm_ground → breath_entrain → nasal_activate |
| `coherence_cascade` | Coherence Cascade | 18 min | breath_entrain → body_scan → phoneme_sequence |
| `deep_signal` | Deep Signal Protocol | 17 min | breath_entrain → coherence_hold → phoneme_sequence |

---

## Biometric Components

### `BreathCoherenceMeter` (mounts only on `breath_entrain`)
- `getUserMedia` → `ScriptProcessor` at 4096 samples
- Computes RMS envelope at 10 Hz
- 20s rolling history with dynamic threshold at 40% of lo-hi range
- Detects rising edges as inhale starts, logs inter-onset intervals
- Scores coherence: `100 - (stddev / 40)` vs 8s cycle (7.5 bpm) target
- Shows: SVG ring score, BPM, INHALE/EXHALE phase, deviation bar

### `MicrophoneAnalyzer` (mounts on `nasal_activate`, `phoneme_sequence`, `body_scan`)
- Full autocorrelation pitch detection (`fftSize=8192`)
- `PITCH_TARGETS`: `nasal_activate` → 110 Hz ±15, `phoneme_sequence` → 136.1 Hz ±20
- Deviation bar: ±80 Hz range, green target zone, live position indicator
- Color-coded: green (on target), amber (near), red (off)
- `body_scan` has no pitch target — shows `getBodyTarget(hz)` anatomical zone text

### `TiltBreathViz`
- `deviceorientation` events — phone tilt as breath proxy
- Animated breathing guide

### `TracingPad`
- SVG canvas with animated guide dot (exercise-specific paths: ellipse/figure-8/triangle/sine/circle)
- Touch/mouse trail with glow filter

---

## FrequencyLab Tab
Multi-layer binaural beat and pure tone generator.

Sub-components:
- `WaveformCanvas` — canvas visualization of active layers
- `WaveIdentifier` — classifies active frequencies against brainwave/body-zone tables
- `ResonanceMath` — calculates interference patterns between layers
- `OutcomeBuilder` — AI-generates a frequency preset for a stated intention, loads it into the lab

Frequency presets are saved to `window.storage("freq_presets")`.

---

## Assessment Tab
Two modes:

**Formative** — 4 questions on a selected section (dropdown shows all 23 sections in two optgroups: Core Corpus / Extended Corpus). Body text is now bundled inline, so remote sections get grounded questions. Passes up to 600 chars per subsection to Claude.

**Summative** — 8 questions across the entire corpus: 3 recall, 3 conceptual, 2 evidence-evaluation (student classifies claims as "established science / speculative but interesting / not currently supported").

Scoring: `assessment.pct >= 80` → familiar gains wisdom.

---

## FamiliarView Tab

Contains (in order):
1. Sigil display with evolution badge
2. Stat bars (V/R/C/W)
3. Attunement button — familiar speaks in character, 70 words, corpus-grounded
4. Commune input — Q&A with the familiar, same register
5. **Field Trajectory** — SVG line chart of `statHistory`, net delta labels per stat
6. **Field Analysis** — AI longitudinal synthesis (unlocks at 3+ sessions). Sends last 20 sessions with pre/post deltas, duration adherence, notes, trajectory summary to Claude as a data analyst (not the familiar voice). Returns plain prose paragraphs.
7. **State Deltas** — per-exercise table of avg Clarity/Calm/Energy delta (unlocks at 3+ rated sessions)
8. Practice record (section count, exercise count, streak)
9. Lore — familiar element/phoneme reference text

---

## AI Calls (`callClaude`)

All calls use `claude-sonnet-4-20250514`, `max_tokens: 1000`.

| Feature | Prompt style | System |
|---------|-------------|--------|
| Attunement | "[ATTUNEMENT]" | Familiar in character, corpus-grounded, 70 words |
| Commune | User question | Same familiar voice, 90 words |
| Deep Analysis | Subsection title + full body text | 4-part analysis: Mechanism/Evidence/Caveat/Next Inquiry |
| Follow-up | Question + full body text | 2–4 sentences, honest precision |
| Concept pill | Concept + subsection body | One-sentence definition |
| Oracle | Free text | Unfamiliar voice, brief |
| Assessment gen | Section titles + body (≤600 chars/sub) | Return JSON array only |
| OutcomeBuilder | Stated intention | Return JSON frequency layer preset |
| Field Analysis | Session digest (20 sessions) + trajectory | Analyst voice, plain prose paragraphs |

`CORPUS_CONTEXT` is a global system prompt prefix injected into every call (defines the AI's role and the framework).

---

## Key Utility Functions

```js
getStage(vitality)       // "thriving"/"healthy"/"struggling"/"dying"
calcDecay(lastActive)    // points of vitality to subtract since lastActive
calcStreak(activeDates)  // { current, longest }
fieldScore(familiar)     // 0–100 composite score
calcEvolutionStage(f)    // returns EVOLUTION_STAGES entry
checkEvolutionCrossing(old, new) // returns new stage if threshold crossed, else null
toDateKey(ts)            // YYYY-MM-DD string
haptic(type)             // navigator.vibrate wrapper
scrubMarkdown(text)      // removes #*_` from AI output
callClaude(messages, systemExtra) // wraps fetch to api.anthropic.com
getBodyTarget(hz)        // anatomical zone string for a frequency
getBrainState(hz)        // brainwave band label for a frequency
```

---

## Admin / Sigil Backdoor

- Triple-tap within 900ms on any section's icon in the Library triggers `SigilUnlockModal`
- Password: `"ohm"`
- On success: `handleAdminLogin()` → `setIsAdmin(true)` → all tier locks removed
- `AdminModal` also accessible via tapping the header title 5 times

---

## Styling conventions

- Dark-only: `bg-gray-950` base, `bg-gray-900` cards, `bg-gray-800` inputs
- Font: `'Courier New', monospace` everywhere
- Tailwind utility classes only — no custom CSS
- Mobile-first, max-width `max-w-xl mx-auto` on content
- Component text sizes: labels `7-9px` inline, body `11-12px`, headings `xs-sm`
- All section/subsection tier colors: T1=emerald, T2=amber/violet, T3=orange/amber
- Evidence tiers in reader: T1=emerald ("Foundation · Well Established"), T2=amber ("Intermediate · Partially Established"), T3=orange ("Advanced · Speculative Territory")

---

## Known Architecture Decisions / Non-obvious Choices

1. **No CDN fetch anywhere.** Claude.ai CSP blocks all `fetch()` except `api.anthropic.com`. All corpus content (all 9 sections, 37 subsections, full body text) is bundled inline in the JSX. `remote:true` flag on sections VII–IX is cosmetic legacy.

2. **`window.storage` not localStorage.** The artifact sandbox provides `window.storage.get/set/delete/list` — this is not Web Storage. It persists across sessions per user.

3. **`ScriptProcessor` for breath detection.** `AudioWorklet` is the modern replacement but has more complex setup; `ScriptProcessor` works reliably in the sandbox.

4. **Stat history snapshots once per calendar day.** The `save()` function checks `lastSnap.date !== today` before pushing. Multiple saves in one day update the familiar but only the first creates a new snapshot point.

5. **`EXERCISES` array has 6 items but only 4 appear in the basic exercise list.** `rhythm_ground` and `coherence_hold` may appear only via Ritual Runs depending on Training tab state. Check the `ExercisesTab` render logic.

6. **Tab state is preserved across navigation.** `tabStates` object in App holds per-tab UI state. Training pauses in-progress exercises when you leave and resumes on return.

7. **JSX syntax validation.** Use `@babel/parser` with `plugins:['jsx']` to validate, not Node's native module runner.

---

## What was built in the last session (most recent additions)

1. **Pitch target overlay in `MicrophoneAnalyzer`** — `PITCH_TARGETS` maps exercises to corpus Hz targets. Deviation bar, color-coded on/near/off feedback, target zone highlight.

2. **`BreathCoherenceMeter`** — new component, envelope follower via ScriptProcessor. Coherence score, BPM, inhale/exhale phase detection. Only mounts on `breath_entrain`.

3. **Field Analysis in `FamiliarView`** — AI longitudinal synthesis. Compiles last 20 sessions with all stateData, calls Claude as a plain analyst (not the familiar). Unlocks at 3+ sessions.

4. **Pre/post state data now actually saved** — was being dropped in `handleExercise`. Fixed to accept `stateData` 5th argument and persist `{pre, post, duration, planned}` on every session.

5. **Stat snapshot history** — `save()` pushes `{date,v,r,c,w}` to `progress.statHistory` once per day, max 90 days.

6. **Field Trajectory graph** — SVG line chart in FamiliarView. 4 stat lines, net delta labels, date range.

7. **State Deltas table** — per-exercise avg Clarity/Calm/Energy delta in FamiliarView. Unlocks at 3+ rated sessions.

8. **Duration bar in session log** — actual vs planned fill bar per session entry.

---

## Things not yet built (discussed, not implemented)

- **Web Bluetooth HRV** — Polar H10 heart rate strap via `navigator.bluetooth`. Real-time HRV during exercises. Would require testing in a non-sandboxed browser environment first.
- **90-day protocol roadmap view** — week-by-week schedule from Consciousness section's 90-day protocol
- **Session note export / practice journal** — users can log notes but can't retrieve them as a document
- **Warmup recommendation** — suggest Tier 1 prerequisite before Tier 2/3 exercises
- **Push notifications for streak protection**
- **"Today's reading" suggestion on dashboard**

---

## File location

The canonical working file is at:
```
/mnt/user-data/outputs/codex-v8.jsx
```

When starting a session, copy it to the working directory:
```bash
cp /mnt/user-data/outputs/codex-v8.jsx /home/claude/codex-v8.jsx
```

After any changes, validate JSX before saving:
```bash
node -e "
const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync('/home/claude/codex-v8.jsx', 'utf8');
try {
  parser.parse(code, { sourceType:'module', plugins:['jsx'] });
  console.log('VALID');
} catch(e) {
  console.log('ERROR:', e.message, 'Line:', e.loc?.line);
  const lines = code.split('\n');
  const l = e.loc?.line - 1;
  for (let i = Math.max(0,l-3); i <= Math.min(lines.length-1,l+3); i++)
    console.log((i===l?'>>>':'   '), i+1, lines[i]);
}
"
```

Then copy to outputs:
```bash
cp /home/claude/codex-v8.jsx /mnt/user-data/outputs/codex-v8.jsx
```

