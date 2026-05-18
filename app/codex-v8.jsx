/*
  TECHNOBIOFASCIAL CODEX — codex-v8.jsx

  Single-file React artifact (mobile-first) designed to run inside Claude.ai
  artifact sandbox. This repo includes a JSX validator (scripts/validate-jsx.mjs)
  using @babel/parser. This file is kept syntactically valid JSX/ESM.

  NOTE: This is a runnable scaffold implementing the full app shell (tabs,
  storage persistence, state schemas, and connected UI flows). Complex
  biometric/AI routines are implemented as safe client-side placeholders to keep
  the artifact runnable in environments without microphone/camera permissions.
*/

import React, { useEffect, useMemo, useRef, useState } from "react";

const APP_NAME = "THE_MATRIX - exploring the lightwave";

// ------------------------ Storage adapter ------------------------
function safeJsonParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

const storage = {
  get(key, fallback = null) {
    if (typeof window === "undefined") return fallback;
    try {
      const api = window.storage;
      if (api && typeof api.get === "function") {
        const result = api.get(key);
        return result === null || result === undefined ? fallback : result;
      }
      if (window.localStorage) {
        const raw = window.localStorage.getItem(key);
        if (raw == null) return fallback;
        const parsed = safeJsonParse(raw, null);
        return parsed === null ? raw : parsed;
      }
    } catch {
      return fallback;
    }
    return fallback;
  },
  set(key, value) {
    if (typeof window === "undefined") return;
    try {
      const api = window.storage;
      if (api && typeof api.set === "function") {
        api.set(key, value);
        return;
      }
      if (window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // ignore storage failures for read-only environments
    }
  },
  delete(key) {
    if (typeof window === "undefined") return;
    try {
      const api = window.storage;
      if (api && typeof api.delete === "function") {
        api.delete(key);
        return;
      }
      if (window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
  },
  list() {
    if (typeof window === "undefined") return [];
    try {
      const api = window.storage;
      if (api && typeof api.list === "function") {
        return api.list();
      }
      if (window.localStorage) {
        return Array.from({ length: window.localStorage.length }).map((_, idx) => window.localStorage.key(idx));
      }
    } catch {
      return [];
    }
    return [];
  },
};

// ------------------------ Corpus data (minimal) ------------------------
// The handoff doc describes a full 9-section corpus bundled inline.
// For this runnable scaffold we include compact body text while preserving
// structure so downstream UI and prompts can work.

const LOCAL_SECTIONS = [
  {
    id: "foundations",
    title: "I. The Solid Foundation",
    tier: 1,
    subsections: [
      { id: "bioelectric", title: "Bioelectric", tier: 1, body: "Breath, phoneme, and posture couple into bioelectric signaling through time-varying neural and autonomic dynamics." },
      { id: "piezo", title: "Piezo", tier: 1, body: "Vibratory pressure at vocal/facial interfaces can couple to mechanical microstrain and piezo-like effects." },
      { id: "quantum_bio", title: "Quantum Bio", tier: 1, body: "Coherence-like descriptions are used as a metaphorical map for structured signal exchange; interpret cautiously." },
      { id: "zpf", title: "ZPF", tier: 1, body: "Zero-point frameworks are invoked for boundary conditions and background noise mapping; treat as speculative." },
    ],
  },
  {
    id: "cascade",
    title: "II. The Transduction Cascade",
    tier: 1,
    subsections: [
      { id: "chain", title: "Chain", tier: 1, body: "Input (breath) → transduction (tissue/vibration) → acoustic/mechanical output → feedback loops." },
      { id: "acoustic_mech", title: "Acoustic Mechanism", tier: 1, body: "Resonances sculpt timing and amplitude envelopes that the body integrates over cycles." },
    ],
  },
  {
    id: "phonetics",
    title: "III. The Phonetic Atlas",
    tier: 2,
    subsections: [
      { id: "nasals", title: "Nasals", tier: 2, body: "Nasals are used to bias cranial cavities and coupling geometries." },
      { id: "vowels", title: "Vowels", tier: 2, body: "Vowels allocate resonance shapes across jaw, throat, and chest cavities." },
    ],
  },
  {
    id: "architecture",
    title: "IV. Sacred Architecture",
    tier: 2,
    subsections: [
      { id: "sites", title: "Sites", tier: 2, body: "Map phoneme choices to anatomical sites as an attentional and acoustic approximation." },
      { id: "schumann", title: "Schumann", tier: 2, body: "Earth-ionosphere resonances are invoked as a contextual rhythmic background." },
    ],
  },
  {
    id: "experiments",
    title: "V. Laboratory Protocols",
    tier: 3,
    subsections: [
      { id: "meridian", title: "Meridian", tier: 3, body: "Protocol design emphasizes timing consistency and measurable subjective clarity." },
      { id: "eeg_phoneme", title: "EEG Phoneme", tier: 3, body: "A speculative bridge: phoneme rhythm may modulate EEG band-likeness via neural synchrony." },
    ],
  },
  {
    id: "synthesis",
    title: "VI. The Grand Synthesis",
    tier: 3,
    subsections: [
      { id: "manual", title: "Manual", tier: 3, body: "Synthesize practice: choose an intention, run a protocol, record pre/post, and iterate." },
      { id: "frequency_table", title: "Frequency Table", tier: 3, body: "Frequency tables act as mnemonic anchors; verify with your own safe listening." },
    ],
  },
];

// Remote sections are included inline in scaffold.
const REMOTE_SECTIONS = [
  {
    id: "arbp",
    title: "VII. The ARBP Framework",
    tier: 2,
    subsections: [
      { id: "premise", title: "Premise", tier: 2, body: "ARBP frames the ritual as a signal processing pipeline: intent → breath → vibration → feedback." },
      { id: "ancient_code", title: "Ancient Code", tier: 2, body: "Symbolic language is treated as structured guidance; the mechanism is still an open research story." },
      { id: "water_medium", title: "Water Medium", tier: 2, body: "Water coupling provides a plausible physical substrate for diffusion-mediated coherence narratives." },
      { id: "arbp_equation", title: "ARBP Equation", tier: 2, body: "Equation form is a compact model; use as a heuristic not a measurement claim." },
      { id: "alchemist_lab", title: "Alchemist Lab", tier: 2, body: "Keep variables controlled: time-of-day, posture, and breath cadence." },
      { id: "digital_grimoire", title: "Digital Grimoire", tier: 2, body: "The grimoire is your record: save sessions, track streaks, and review trajectories." },
    ],
  },
  {
    id: "consciousness",
    title: "VIII. Consciousness Cartography",
    tier: 1,
    subsections: [
      { id: "universe_vibration", title: "Universe Vibration", tier: 1, body: "Consciousness is mapped as a resonance interpretation; confidence should track evidence level." },
      { id: "consciousness_field", title: "Consciousness Field", tier: 1, body: "Field language is used for integration of sensory timing and attention." },
      { id: "seven_states", title: "Seven States", tier: 1, body: "A seven-state model organizes practice quality categories." },
      { id: "body_antenna", title: "Body Antenna", tier: 1, body: "The body acts as a transducer: it converts acoustic timing into internal dynamics." },
      { id: "spectrum_model", title: "Spectrum Model", tier: 1, body: "Band-likeness is used descriptively; treat as a label system." },
      { id: "closing_paradox", title: "Closing Paradox", tier: 1, body: "Precision and mystery co-exist: keep records to know what you can actually claim." },
    ],
  },
  {
    id: "keppler",
    title: "IX. Quantum Coherence",
    tier: 3,
    subsections: [
      { id: "keppler_overview", title: "Keppler Overview", tier: 3, body: "A coherence metaphor that uses domain structure (orbital relations) to map rhythm stability." },
      { id: "keppler_equations", title: "Keppler Equations", tier: 3, technical: true, body: "{ technical: true }" },
      { id: "coherence_domains", title: "Coherence Domains", tier: 3, technical: true, body: "{ technical: true }" },
      { id: "thz_problem", title: "THz Problem", tier: 3, body: "Practical constraints: frequency claims need careful experimental safety and verification." },
      { id: "keppler_experiments", title: "Keppler Experiments", tier: 3, body: "Use repeatable timing and save pre/post to evaluate change." },
    ],
  },
  {
    id: "parallel_resonance",
    title: "X. Parallel Resonance",
    tier: 2,
    subsections: [
      { id: "metric_lattice", title: "Metric Lattice", tier: 2, body: "Spatial maps quantify how resonant fields self-organize across scales." },
      { id: "phase_bridges", title: "Phase Bridges", tier: 2, body: "Phase relationships act as bridges between sensory rhythm and bodily state." },
      { id: "archive_forging", title: "Archive Forging", tier: 2, body: "Record protocols as structured data to support repeated attunement." },
    ],
  },
];

const ALL_SECTIONS = [...LOCAL_SECTIONS, ...REMOTE_SECTIONS];

// ------------------------ Exercises / Ritual Runs ------------------------
const EXERCISES = [
  { id: "breath_entrain", title: "Breath Entrainment", tier: 1, duration: 300, statGain: "vitality", biometric: "BreathCoherenceMeter" },
  { id: "nasal_activate", title: "Sphenoid Activation", tier: 1, duration: 180, statGain: "resonance", biometric: "MicrophoneAnalyzer" },
  { id: "body_scan", title: "Frequency Body Scan", tier: 2, duration: 420, statGain: "coherence", biometric: "MicrophoneAnalyzer" },
  { id: "coherence_hold", title: "Signal Clarity Practice", tier: 2, duration: 600, statGain: "coherence", biometric: "TracingPad" },
  { id: "phoneme_sequence", title: "Full Phoneme Sequence", tier: 3, duration: 240, statGain: "resonance", biometric: "MicrophoneAnalyzer" },
  { id: "tonal_bridge", title: "Tonal Bridge", tier: 2, duration: 240, statGain: "wisdom", biometric: "BreathCoherenceMeter" },
  { id: "field_probe", title: "Field Probe Sequence", tier: 3, duration: 360, statGain: "coherence", biometric: "MicrophoneAnalyzer" },
  { id: "rhythm_ground", title: "Entrainment Listen", tier: 1, duration: 180, statGain: "vitality", biometric: "TiltBreathViz" },
];

const RITUALS = [
  { id: "grounding", name: "Grounding Protocol", duration: 660, exercises: ["rhythm_ground", "breath_entrain", "nasal_activate"] },
  { id: "coherence_cascade", name: "Coherence Cascade", duration: 1080, exercises: ["breath_entrain", "body_scan", "phoneme_sequence"] },
  { id: "deep_signal", name: "Deep Signal Protocol", duration: 1020, exercises: ["breath_entrain", "coherence_hold", "phoneme_sequence"] },
  { id: "harmonic_bridge", name: "Harmonic Bridge", duration: 900, exercises: ["breath_entrain", "tonal_bridge", "body_scan"] },
];

// ------------------------ Familiar system ------------------------
const FAMILIAR_TYPES = [
  { id: "ah", name: "Anahata", element: "Heart Field", phoneme: "AH", stat: "vitality", hue: 0 },
  { id: "ee", name: "Bindu", element: "Crown Signal", phoneme: "EE", stat: "wisdom", hue: 40 },
  { id: "hh", name: "Akasha", element: "Field Presence", phoneme: "HH", stat: "coherence", hue: 260 },
  { id: "ka", name: "Muladhara", element: "Ground Current", phoneme: "KA", stat: "vitality", hue: 10 },
  { id: "ng", name: "Ajna", element: "Third Eye Resonance", phoneme: "NG", stat: "resonance", hue: 140 },
  { id: "oh", name: "Manipura", element: "Solar Plexus", phoneme: "OH", stat: "coherence", hue: 120 },
  { id: "om", name: "Sahasrara", element: "The Column", phoneme: "OM", stat: "wisdom", hue: 55 },
];

function fieldScore(f) {
  if (!f) return 0;
  return Math.max(
    0,
    Math.min(
      100,
      f.vitality * 0.2 + f.resonance * 0.25 + f.coherence * 0.3 + f.wisdom * 0.25
    )
  );
}

function calcDecay(lastActive) {
  if (!lastActive) return 0;
  const ms = Date.now() - lastActive;
  const days = ms / (1000 * 60 * 60 * 24);
  // Simple decay: ~1.2 vitality per day scaled; clamp.
  const decay = Math.floor(days * 1.2);
  return Math.max(0, Math.min(30, decay));
}

function toDateKey(ts) {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const EVOLUTION_STAGES = [
  { id: "nascent", label: "Nascent", min: 0, max: 17 },
  { id: "forming", label: "Forming", min: 18, max: 37 },
  { id: "established", label: "Established", min: 38, max: 61 },
  { id: "transcendent", label: "Transcendent", min: 62, max: 100 },
];

function calcEvolutionStage(f) {
  const score = fieldScore(f);
  return EVOLUTION_STAGES.find((s) => score >= s.min && score <= s.max) || EVOLUTION_STAGES[0];
}

function checkEvolutionCrossing(oldF, newF) {
  const oldS = calcEvolutionStage(oldF);
  const newS = calcEvolutionStage(newF);
  if (oldS.id !== newS.id) return newS;
  return null;
}

function haptic(type) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(type === "light" ? 15 : 40);
    }
  } catch {
    // ignore
  }
}

// ------------------------ AI call placeholder ------------------------
// In the Claude sandbox, fetch to api.anthropic.com may be available.
// This scaffold keeps the function safe and returns deterministic placeholders
// if credentials are not present.
async function callClaude(messages, systemExtra = "") {
  const apiKey = storage.get("anthropic_api_key", null); // user can optionally set
  const system = systemExtra ? systemExtra : "";

  // If no key, return placeholder
  if (!apiKey || typeof fetch === "undefined") {
    return {
      ok: false,
      text: "(AI unavailable in this environment. Scaffold returned placeholder text.)",
      raw: null,
    };
  }

  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: system || undefined,
    messages,
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();
  const text = json?.content?.map((c) => c?.text ?? "").join("") || json?.error?.message || "";
  return { ok: res.ok, text, raw: json };
}

// ------------------------ UI helpers ------------------------
function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function sanitizeString(value, fallback = "") {
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, 260);
}

function sanitizeNumber(value, min = 0, max = 100, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return clamp(n, min, max);
}

function sanitizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "false") return value === "true";
  return fallback;
}

function sanitizeArray(value, itemFn) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (itemFn ? itemFn(item) : item))
    .filter((item) => item !== null && item !== undefined);
}

function sanitizeRating(value) {
  if (!value || typeof value !== "object") return null;
  return {
    clarity: sanitizeNumber(value.clarity, 1, 5, 3),
    calm: sanitizeNumber(value.calm, 1, 5, 3),
    energy: sanitizeNumber(value.energy, 1, 5, 3),
  };
}

function sanitizeSessionEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  return {
    date: Number.isFinite(Number(entry.date)) ? Number(entry.date) : Date.now(),
    exId: sanitizeString(entry.exId, "unknown"),
    note: sanitizeString(entry.note, ""),
    runId: sanitizeString(entry.runId, `${Date.now()}`),
    pre: sanitizeRating(entry.pre),
    post: sanitizeRating(entry.post),
    duration: Number.isFinite(Number(entry.duration)) ? Number(entry.duration) : null,
    planned: Number.isFinite(Number(entry.planned)) ? Number(entry.planned) : null,
  };
}

function sanitizeAssessmentEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const questions = sanitizeArray(entry.questions, (q) => {
    if (!q || typeof q !== "object") return null;
    return { q: sanitizeString(q.q, ""), a: sanitizeString(q.a, "") };
  });
  return {
    id: sanitizeString(entry.id, `assess-${Date.now()}`),
    date: Number.isFinite(Number(entry.date)) ? Number(entry.date) : Date.now(),
    sectionId: sanitizeString(entry.sectionId, ALL_SECTIONS[0]?.id || ""),
    mode: sanitizeString(entry.mode, "formative"),
    score: sanitizeNumber(entry.score, 0, 100, 0),
    pct: sanitizeNumber(entry.pct, 0, 100, 0),
    questions,
    note: sanitizeString(entry.note, ""),
  };
}

function sanitizeProgress(value) {
  if (!value || typeof value !== "object") value = {};
  const read = value.read && typeof value.read === "object" ? value.read : {};
  const sanitizedRead = {};
  for (const [key, ts] of Object.entries(read)) {
    if (typeof key === "string" && Number.isFinite(Number(ts))) {
      sanitizedRead[key] = Number(ts);
    }
  }

  const sessions = sanitizeArray(value.sessions, sanitizeSessionEntry);
  const assessments = sanitizeArray(value.assessments, sanitizeAssessmentEntry);
  const exercises = sanitizeArray(value.exercises, (item) => (typeof item === "string" ? item : null));
  const completedRuns = sanitizeArray(value.completedRuns, (item) => {
    if (!item || typeof item !== "object") return null;
    return {
      runId: sanitizeString(item.runId, `${Date.now()}`),
      date: Number.isFinite(Number(item.date)) ? Number(item.date) : Date.now(),
    };
  });
  const streakData = value.streakData && typeof value.streakData === "object" ? value.streakData : {};
  const activeDates = sanitizeArray(streakData.activeDates, (date) => {
    if (typeof date !== "string") return null;
    return sanitizeString(date);
  });
  const statHistory = sanitizeArray(value.statHistory, (item) => {
    if (!item || typeof item !== "object") return null;
    const date = sanitizeString(item.date, toDateKey(Date.now()));
    return {
      date,
      v: sanitizeNumber(item.v, 0, 100, 0),
      r: sanitizeNumber(item.r, 0, 100, 0),
      c: sanitizeNumber(item.c, 0, 100, 0),
      w: sanitizeNumber(item.w, 0, 100, 0),
    };
  });

  return {
    read: sanitizedRead,
    exercises,
    sessions,
    assessments,
    completedRuns,
    streakData: { activeDates },
    statHistory,
  };
}

function sanitizeFamiliar(value) {
  if (!value || typeof value !== "object") value = {};
  const type = FAMILIAR_TYPES.find((t) => t.id === value.type) ? value.type : "ah";
  return {
    type,
    vitality: sanitizeNumber(value.vitality, 0, 100, 10),
    resonance: sanitizeNumber(value.resonance, 0, 100, 10),
    coherence: sanitizeNumber(value.coherence, 0, 100, 10),
    wisdom: sanitizeNumber(value.wisdom, 0, 100, 10),
    lastActive: Number.isFinite(Number(value.lastActive)) ? Number(value.lastActive) : Date.now(),
  };
}

function sanitizeProfile(value) {
  if (!value || typeof value !== "object") value = {};
  return {
    name: sanitizeString(value.name, "Explorer"),
    intention: sanitizeString(value.intention, "Let the matrix speak"),
  };
}

function sanitizeTabStates(value) {
  if (!value || typeof value !== "object") value = {};
  return {
    library: {
      selectedSectionId: sanitizeString(value.library?.selectedSectionId, ALL_SECTIONS[0]?.id || ""),
    },
    training: {
      selectedExerciseId: sanitizeString(value.training?.selectedExerciseId, EXERCISES[0]?.id || ""),
      ritualId: sanitizeString(value.training?.ritualId, null),
      runningSession: sanitizeBoolean(value.training?.runningSession, false),
    },
    assessment: {
      mode: sanitizeString(value.assessment?.mode, "formative"),
      sectionId: sanitizeString(value.assessment?.sectionId, ALL_SECTIONS[0]?.id || ""),
      results: value.assessment?.results || null,
    },
    frequency: {
      intention: sanitizeString(value.frequency?.intention, "focus"),
      layers: Array.isArray(value.frequency?.layers) ? value.frequency.layers : [],
    },
    familiar: {
      aiBusy: sanitizeBoolean(value.familiar?.aiBusy, false),
      communeText: sanitizeString(value.familiar?.communeText, "What should I practice next?"),
      analysis: sanitizeString(value.familiar?.analysis, null),
    },
    dashboard: {},
  };
}

function sanitizeSessionSnapshot(value) {
  if (!value || typeof value !== "object") return { view: "dashboard", tabStates: sanitizeTabStates({}) };
  return {
    view: sanitizeString(value.view, "dashboard"),
    tabStates: sanitizeTabStates(value.tabStates || {}),
  };
}

function sanitizeFrequencyLayer(layer) {
  if (!layer || typeof layer !== "object") return null;
  const hz = Number(layer.hz);
  const gain = Number(layer.gain);
  if (!Number.isFinite(hz) || !Number.isFinite(gain)) return null;
  return {
    id: sanitizeString(layer.id, `layer_${Date.now()}`),
    hz: hz,
    gain: clamp(gain, 0, 1),
  };
}

function sanitizeFrequencyPreset(value) {
  if (!value || typeof value !== "object") return null;
  return {
    id: sanitizeString(value.id, `${Date.now()}`),
    intention: sanitizeString(value.intention, ""),
    layers: sanitizeArray(value.layers, sanitizeFrequencyLayer),
  };
}

function sanitizeFrequencyPresets(value) {
  return sanitizeArray(value, sanitizeFrequencyPreset);
}

function normalizeView(value) {
  const view = sanitizeString(value, "dashboard");
  return ["dashboard", "library", "frequency", "training", "assessment", "familiar"].includes(view)
    ? view
    : "dashboard";
}

function sanitizeListKey(key) {
  return sanitizeString(key, "");
}

function sanitizeDateKey(key) {
  return sanitizeString(key, toDateKey(Date.now()));
}

function sanitizeSectionId(value) {
  return sanitizeString(value, ALL_SECTIONS[0]?.id || "");
}

function sanitizeExerciseId(value) {
  return sanitizeString(value, EXERCISES[0]?.id || "");
}

function sanitizeStreakData(value) {
  const activeDates = sanitizeArray(value?.activeDates, (date) => (typeof date === "string" ? sanitizeString(date) : null));
  return { activeDates };
}

function sanitizeStatHistory(value) {
  return sanitizeArray(value, (item) => {
    if (!item || typeof item !== "object") return null;
    return {
      date: sanitizeDateKey(item.date),
      v: sanitizeNumber(item.v, 0, 100, 0),
      r: sanitizeNumber(item.r, 0, 100, 0),
      c: sanitizeNumber(item.c, 0, 100, 0),
      w: sanitizeNumber(item.w, 0, 100, 0),
    };
  });
}

function sanitizeSessionState(value) {
  if (!value || typeof value !== "object") return null;
  return {
    view: normalizeView(value.view),
    tabStates: sanitizeTabStates(value.tabStates || {}),
  };
}

function sanitizeQueryString(value) {
  return sanitizeString(value, "");
}

function sanitizeBooleanString(value) {
  return sanitizeBoolean(value, false);
}

function sanitizePayload(value) {
  return value && typeof value === "object" ? value : {};
}

function sanitizeStorageValue(key, value) {
  if (key === "profile") return sanitizeProfile(value);
  if (key === "familiar") return sanitizeFamiliar(value);
  if (key === "progress") return sanitizeProgress(value);
  if (key === "session") return sanitizeSessionSnapshot(value);
  if (key === "freq_presets") return sanitizeFrequencyPresets(value);
  if (key === "lastView") return normalizeView(value);
  if (key === "isAdmin") return sanitizeBoolean(value, false) ? "true" : "false";
  return value;
}

function StarDots({ value, onChange, label }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[7px] text-gray-300 whitespace-nowrap">{label}</div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => {
          const active = i <= value;
          return (
            <button
              key={i}
              onClick={() => onChange(i)}
              className={cx(
                "w-6 h-6 rounded-full border text-[10px]",
                active ? "bg-emerald-500/25 border-emerald-400 text-emerald-200" : "bg-gray-900/60 border-gray-700 text-gray-400"
              )}
              aria-label={`${label} ${i}`}
              type="button"
            >
              ●
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Segmented({ value, options, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-800 bg-gray-900/40">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cx(
              "flex-1 text-center px-2 py-2 text-[11px]",
              active ? "bg-emerald-500/20 text-emerald-200" : "bg-gray-950/10 text-gray-400 hover:text-gray-200"
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------ Core biometric placeholders ------------------------
function BreathCoherenceMeter({ running, onTick }) {
  // placeholder: emits a fake coherence score oscillating over time
  const [score, setScore] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      const v = 70 + 20 * Math.sin(t * (Math.PI / 4));
      const s = clamp(v, 0, 100);
      setScore(s);
      onTick?.(s);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
      <div className="text-[11px] text-gray-200">Breath Coherence (scaffold)</div>
      <div className="mt-2 flex items-center justify-between">
        <div className="text-[18px] text-emerald-200 font-mono">{Math.round(score)}</div>
        <div className="text-[10px] text-gray-400">BPM: {Math.round(7.5 * (1 + (score - 70) / 300))} • Phase: IN/OUT</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
        <div className="h-full bg-emerald-500/60" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function MicrophoneAnalyzer({ running, targetHz, label }) {
  const [deviation, setDeviation] = useState(0);
  const [hz, setHz] = useState(targetHz);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = Date.now();
    const tick = () => {
      const t = (Date.now() - start) / 1000;
      const drift = Math.sin(t * 1.3) * (targetHz * 0.12);
      const noise = Math.sin(t * 5.2) * (targetHz * 0.03);
      const current = targetHz + drift + noise;
      setHz(current);
      setDeviation(Math.abs(current - targetHz));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, targetHz]);

  const near = deviation <= 10;
  const on = deviation <= 5;
  const color = on ? "text-emerald-200" : near ? "text-amber-200" : "text-red-200";

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] text-gray-200">{label}</div>
          <div className="text-[10px] text-gray-400">Target: {targetHz.toFixed(1)} Hz • Δ {deviation.toFixed(1)} Hz</div>
        </div>
        <div className={cx("text-[12px] font-mono", color)}>{on ? "ON" : near ? "NEAR" : "OFF"}</div>
      </div>
      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
        <div className={cx("h-full", on ? "bg-emerald-500/70" : near ? "bg-amber-500/70" : "bg-red-500/70")} style={{ width: `${clamp(100 - deviation * 5, 0, 100)}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
        <div>Now: {hz.toFixed(1)} Hz</div>
        <div>Zone: green • range ±{targetHz < 150 ? 20 : 30} Hz</div>
      </div>
    </div>
  );
}

function CodeBlock({ code, language }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-950/30 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-gray-800">
        <div className="text-[10px] text-gray-400 font-mono">{language ? `${language} • code snippet` : "Code snippet"}</div>
        <div className="text-[10px] text-gray-500 font-mono">{(code || "").split("\n").length} lines</div>
      </div>
      <pre className="p-3 text-[11px] text-gray-100 overflow-auto whitespace-pre-wrap font-mono">
        {code}
      </pre>
    </div>
  );
}

function TechnicalBodyDisplay({ technical, body, id }) {
  // NOTE: this component renders technical:true subsections as code blocks.
  // The scaffolded snippet content is keyed by subsection id.
  const snippet = (() => {
    if (id === "keppler_equations") {
      return [
        "# Keppler equations (technical)",
        "# Scaffolded visualization: orbital relations and coherence metaphors",
        "",
        "import math",
        "",
        "def eccentric_anomaly(M, e, tol=1e-10, itmax=64):",
        "    # Solve Kepler's equation: M = E - e*sin(E)",
        "    E = M if e < 0.8 else math.pi",
        "    for _ in range(itmax):",
        "        f = E - e*math.sin(E) - M",
        "        fp = 1 - e*math.cos(E)",
        "        dE = -f/fp",
        "        E = E + dE",
        "        if abs(dE) < tol:",
        "            break",
        "    return E",
        "",
        "def orbit_radius(a, e, E):",
        "    # r = a(1 - e cos E)",
        "    return a * (1 - e*math.cos(E))",
      ].join("\n");
    }

    if (id === "coherence_domains") {
      return [
        "# Coherence domains (technical)",
        "# Scaffolded mapping: define domain bands for interpreting stability",
        "",
        "DOMAIN = {",
        "  'nascent': (0, 17),",
        "  'forming': (18, 37),",
        "  'established': (38, 61),",
        "  'transcendent': (62, 100),",
        "}",
        "",
        "def classify_score(score):",
        "    for k, (lo, hi) in DOMAIN.items():",
        "        if lo <= score <= hi:",
        "            return k",
        "    return 'nascent'",
      ].join("\n");
    }

    return ["# Technical snippet (scaffold)", "# This section is marked technical:true in the corpus."].join("\n");
  })();
  // (Removed duplicated scaffold logic that caused syntax errors)
  ;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] text-emerald-200 font-mono">TECHNICAL • {id || "snippet"}</div>
      <CodeBlock code={snippet} language="python" />
      {body && body !== "{ technical: true }" && (
        <div className="text-[11px] text-gray-300 leading-relaxed">{body}</div>
      )}
    </div>
  );
}

function TracingPad({ running, mode }) {
  // minimal animated SVG tracing
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const start = Date.now();
    const loop = () => {
      setTick((Date.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const phase = tick % (Math.PI * 2);
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
      <div className="text-[11px] text-gray-200">Tracing Pad (scaffold)</div>
      <svg viewBox="0 0 120 60" className="w-full h-[120px] mt-2" aria-hidden="true">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M10 45 C 30 10, 55 10, 70 28 S 95 52, 110 20"
          fill="none"
          stroke="#334155"
          strokeWidth="2"
        />
        <circle
          cx={60 + 45 * Math.sin(phase)}
          cy={30 + 15 * Math.cos(phase)}
          r="3.2"
          fill="#34d399"
          filter="url(#glow)"
        />
      </svg>
      <div className="text-[10px] text-gray-400">Mode: {mode || "default"}</div>
    </div>
  );
}

function TiltBreathViz({ running }) {
  const [tilt, setTilt] = useState(0);
  useEffect(() => {
    if (!running) return;
    const handler = (e) => {
      const g = e.gamma ?? 0;
      setTilt(clamp(g, -30, 30));
    };
    window.addEventListener("deviceorientation", handler, { passive: true });
    return () => window.removeEventListener("deviceorientation", handler);
  }, [running]);

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
      <div className="text-[11px] text-gray-200">Tilt Breath Viz (scaffold)</div>
      <div className="mt-2 text-[10px] text-gray-400">Tilt γ: {tilt.toFixed(0)}°</div>
      <div className="mt-2 h-2 rounded-full bg-gray-800 overflow-hidden">
        <div className="h-full bg-emerald-500/60" style={{ width: `${clamp((tilt + 30) / 60, 0, 1) * 100}%` }} />
      </div>
    </div>
  );
}

// ------------------------ Exercise runtime flow ------------------------
function formatSeconds(s) {
  const mm = Math.floor(s / 60);
  const ss = Math.floor(s % 60);
  return `${mm}:${String(ss).padStart(2, "0")}`;
}

function PreRatingModal({ open, ex, onDone, onClose }) {
  const [clarity, setClarity] = useState(3);
  const [calm, setCalm] = useState(3);
  const [energy, setEnergy] = useState(3);

  useEffect(() => {
    if (!open) return;
    setClarity(3);
    setCalm(3);
    setEnergy(3);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/70 flex items-end justify-center p-3 z-50">
      <div className="w-full max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] text-gray-200 font-mono">PRE • {ex?.title}</div>
            <div className="text-[10px] text-gray-400 mt-1">Rate your baseline before the run.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <StarDots value={clarity} onChange={setClarity} label="Clarity" />
          <StarDots value={calm} onChange={setCalm} label="Calm" />
          <StarDots value={energy} onChange={setEnergy} label="Energy" />
        </div>

        <button
          type="button"
          onClick={() => onDone({ clarity, calm, energy })}
          className="mt-4 w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono"
        >
          Start • {formatSeconds(ex?.duration || 0)}
        </button>
      </div>
    </div>
  );
}

function PostRatingModal({ open, ex, onDone, onClose }) {
  const [clarity, setClarity] = useState(3);
  const [calm, setCalm] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setClarity(3);
    setCalm(3);
    setEnergy(3);
    setNote("");
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-950/70 flex items-end justify-center p-3 z-50">
      <div className="w-full max-w-xl rounded-xl border border-gray-800 bg-gray-900 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[12px] text-gray-200 font-mono">POST • {ex?.title}</div>
            <div className="text-[10px] text-gray-400 mt-1">Rate how you feel after the run.</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[12px] text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          <StarDots value={clarity} onChange={setClarity} label="Clarity" />
          <StarDots value={calm} onChange={setCalm} label="Calm" />
          <StarDots value={energy} onChange={setEnergy} label="Energy" />
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-gray-400 mb-1">Optional note (max ~220 chars recommended)</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 220))}
            className="w-full min-h-[76px] resize-none rounded-lg bg-gray-950/20 border border-gray-800 text-[12px] text-gray-200 p-2"
            placeholder="What changed during the run?"
          />
        </div>

        <button
          type="button"
          onClick={() => onDone({ clarity, calm, energy, note })}
          className="mt-4 w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono"
        >
          Save Session
        </button>
      </div>
    </div>
  );
}

function CountdownRing({ secondsLeft, totalSeconds }) {
  const pct = totalSeconds ? clamp((secondsLeft / totalSeconds) * 100, 0, 100) : 0;
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-[92px] h-[92px]">
      <svg viewBox="0 0 92 92" className="w-[92px] h-[92px]" aria-hidden="true">
        <circle cx="46" cy="46" r={radius} stroke="#111827" strokeWidth="8" fill="none" />
        <circle
          cx="46"
          cy="46"
          r={radius}
          stroke="#34d399"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ - dash}`}
          transform="rotate(-90 46 46)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-[12px] text-emerald-200 font-mono">{formatSeconds(secondsLeft)}</div>
      </div>
    </div>
  );
}

function DynamicStepFlow({ stepIndex, previewLabel }) {
  const steps = ["prev", "current", "next", "ghost"];
  return (
    <div className="mt-2">
      <div className="text-[10px] text-gray-400">Flow</div>
      <div className="mt-1 flex gap-2">
        {steps.map((k, i) => {
          const active = k === "current";
          const bright = i === stepIndex;
          return (
            <div
              key={k}
              className={cx(
                "flex-1 rounded-lg border p-2",
                bright ? "border-emerald-500/40 bg-emerald-500/10" : "border-gray-800 bg-gray-900/30"
              )}
            >
              <div className="text-[10px] text-gray-200">{k}</div>
              <div className="text-[9px] text-gray-400 mt-1">{active ? previewLabel : ""}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ------------------------ Tabs ------------------------
function TabButton({ active, label, icon, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "flex-1 flex flex-col items-center justify-center py-3 rounded-t-xl",
        active ? "text-emerald-200" : "text-gray-400"
      )}
    >
      <div className="text-[18px] leading-none">{icon || "●"}</div>
      <div className="text-[10px] font-mono">{label}</div>
    </button>
  );
}

function Card({ children, className }) {
  return <div className={cx("rounded-3xl border border-gray-800 bg-gray-900/40 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]", className)}>{children}</div>;
}

function Badge({ label, variant = "muted" }) {
  const classes = {
    muted: "bg-gray-800 text-gray-200 border border-gray-700",
    accent: "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20",
    alert: "bg-rose-500/10 text-rose-200 border border-rose-500/20",
  };
  return <span className={cx("inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.16em]", classes[variant] || classes.muted)}>{label}</span>;
}

function SmallStat({ label, value, accent }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className={cx("text-[13px] font-mono", accent)}>{Math.round(value)}</div>
    </div>
  );
}

// ------------------------ Astrolabe (deterministic scaffold) ------------------------
const ASTRO_ZODIAC = [
  { i: 0, name: "Aries", symbol: "♈", element: "Fire" },
  { i: 1, name: "Taurus", symbol: "♉", element: "Earth" },
  { i: 2, name: "Gemini", symbol: "♊", element: "Air" },
  { i: 3, name: "Cancer", symbol: "♋", element: "Water" },
  { i: 4, name: "Leo", symbol: "♌", element: "Fire" },
  { i: 5, name: "Virgo", symbol: "♍", element: "Earth" },
  { i: 6, name: "Libra", symbol: "♎", element: "Air" },
  { i: 7, name: "Scorpio", symbol: "♏", element: "Water" },
  { i: 8, name: "Sagittarius", symbol: "♐", element: "Fire" },
  { i: 9, name: "Capricorn", symbol: "♑", element: "Earth" },
  { i: 10, name: "Aquarius", symbol: "♒", element: "Air" },
  { i: 11, name: "Pisces", symbol: "♓", element: "Water" },
];

const ASTRO_PLANETS = [
  // periods in days (deterministic, stylized—not ephemeris)
  { id: "mercury", name: "Mercury", periodDays: 88 },
  { id: "venus", name: "Venus", periodDays: 225 },
  { id: "mars", name: "Mars", periodDays: 687 },
  { id: "jupiter", name: "Jupiter", periodDays: 4333 },
  { id: "saturn", name: "Saturn", periodDays: 10759 },
  { id: "sun", name: "Sun", periodDays: 365.25 },
  { id: "moon", name: "Moon", periodDays: 27.3217 },
];

const ASTRO_SOLAR_CYCLE_DAYS = 365.25;
const ASTRO_LUNAR_CYCLE_DAYS = 29.530588;

function mod(n, m) {
  return ((n % m) + m) % m;
}

function dayFrac(ts) {
  const d = new Date(ts);
  const ms = d.getHours() * 3600000 + d.getMinutes() * 60000 + d.getSeconds() * 1000 + d.getMilliseconds();
  return ms / 86400000;
}

function computeAstrolabeState(nowTs, familiarSnapshot) {
  const now = nowTs || Date.now();

  // Seed familiar-weighting so the HUD is personalized but deterministic per current state.
  const V = clamp((familiarSnapshot?.vitality ?? 10) / 100, 0, 1);
  const R = clamp((familiarSnapshot?.resonance ?? 10) / 100, 0, 1);
  const C = clamp((familiarSnapshot?.coherence ?? 10) / 100, 0, 1);
  const W = clamp((familiarSnapshot?.wisdom ?? 10) / 100, 0, 1);

  // Zodiac: map a stylized year fraction (plus familiar offset) into 12 sectors.
  const solarDays = now / 86400000;
  const yearFrac = mod(solarDays / ASTRO_SOLAR_CYCLE_DAYS + dayFrac(now) * 0.25 + (V - W) * 0.08, 1);
  const zodiacIndex = Math.floor(yearFrac * 12) % 12;
  const zodiac = ASTRO_ZODIAC[zodiacIndex];

  // Solar phase: 8-node wheel (octants)
  const solarPhaseFrac = mod(solarDays / ASTRO_SOLAR_CYCLE_DAYS + 0.03 * (R - C) + 0.02 * dayFrac(now), 1);
  const solarNode = Math.floor(solarPhaseFrac * 8) % 8;
  const solarPhaseRemaining = (1 - solarPhaseFrac) * ASTRO_SOLAR_CYCLE_DAYS;

  // Lunar phase: 6-node wheel (hexants)
  const lunarDays = now / 86400000;
  const lunarPhaseFrac = mod(lunarDays / ASTRO_LUNAR_CYCLE_DAYS + 0.04 * (C - R), 1);
  const lunarNode = Math.floor(lunarPhaseFrac * 6) % 6;
  const lunarPhaseRemaining = (1 - lunarPhaseFrac) * ASTRO_LUNAR_CYCLE_DAYS;

  // Planetary bands: 7 bodies. Each maps to a band weight via its period position.
  // The HUD expands “scales and periods” by exposing (a) period, (b) phase, (c) band weight.
  const planets = ASTRO_PLANETS.map((p) => {
    const phaseFrac = mod(solarDays / p.periodDays + 0.02 * (W - V) + 0.01 * dayFrac(now), 1);
    const phaseAngle = phaseFrac * Math.PI * 2;
    const wave = 0.5 + 0.5 * Math.sin(phaseAngle);
    const weight = clamp(wave * 0.55 + (p.id === "moon" ? C * 0.35 : p.id === "sun" ? W * 0.35 : R * 0.2), 0, 1);

    // “Band” resolves into a 4-level emphasis (A/B/C/D)
    const bandIdx = Math.floor(weight * 4) % 4;
    const band = ["DORMANT", "SUBTLE", "ACTIVE", "AMPLIFIED"][bandIdx];

    return { ...p, phaseFrac, weight, band, bandIdx };
  });

  // Select top 3 planets by weight for concise HUD emphasis.
  const topPlanets = [...planets].sort((a, b) => b.weight - a.weight).slice(0, 3);

  // Interconnectivity: map each planetary emphasis into the V/R/C/W axes.
  // Deterministic weights: adjacency depends on which node is active.
  const axis = {
    vitality: 0,
    resonance: 0,
    coherence: 0,
    wisdom: 0,
  };

  for (const pl of planets) {
    // base mapping
    const base = {
      mercury: { resonance: 0.30, coherence: 0.20, vitality: 0.10, wisdom: 0.10 },
      venus: { resonance: 0.15, coherence: 0.25, vitality: 0.25, wisdom: 0.15 },
      mars: { vitality: 0.35, resonance: 0.25, coherence: 0.05, wisdom: 0.10 },
      jupiter: { wisdom: 0.35, coherence: 0.10, resonance: 0.10, vitality: 0.15 },
      saturn: { coherence: 0.35, wisdom: 0.20, vitality: 0.10, resonance: 0.10 },
      sun: { wisdom: 0.25, vitality: 0.25, resonance: 0.15, coherence: 0.15 },
      moon: { coherence: 0.30, resonance: 0.20, vitality: 0.10, wisdom: 0.15 },
    }[pl.id];

    const nodeBoost = (solarNode % 2 === 0 ? 1.06 : 0.98) * (lunarNode % 2 === 0 ? 1.05 : 0.99);
    const boost = pl.weight * nodeBoost;

    axis.vitality += (base.vitality || 0) * boost;
    axis.resonance += (base.resonance || 0) * boost;
    axis.coherence += (base.coherence || 0) * boost;
    axis.wisdom += (base.wisdom || 0) * boost;
  }

  // Normalize axis to 0..100 scale for display
  const axisVals = Object.values(axis);
  const maxAxis = Math.max(...axisVals, 1e-6);
  const axisNormalized = {
    vitality: (axis.vitality / maxAxis) * 100,
    resonance: (axis.resonance / maxAxis) * 100,
    coherence: (axis.coherence / maxAxis) * 100,
    wisdom: (axis.wisdom / maxAxis) * 100,
  };

  // Edge list: which axes are most influenced by which top planets.
  const edges = [];
  for (const pl of topPlanets) {
    const contributions = {
      vitality: axis.vitality,
      resonance: axis.resonance,
      coherence: axis.coherence,
      wisdom: axis.wisdom,
    };
    // Heuristic: tie planet to the strongest axisNormalized component.
    const strongestAxis = Object.entries(axisNormalized).sort((a, b) => b[1] - a[1])[0]?.[0];
    const labelMap = {
      vitality: "V",
      resonance: "R",
      coherence: "C",
      wisdom: "W",
    };
    edges.push({ from: pl.name, to: labelMap[strongestAxis] || "?", strength: Math.round(pl.weight * 100) });
  }

  // Remaining counters (days/hours)
  const remainingToH = (days) => {
    const totalHours = Math.max(0, Math.floor(days * 24));
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    return { d, h };
  };

  const solarRemaining = remainingToH(solarPhaseRemaining);
  const lunarRemaining = remainingToH(lunarPhaseRemaining);

  return {
    now,
    zodiacIndex,
    zodiac,
    solar: {
      phaseFrac: solarPhaseFrac,
      node: solarNode,
      remainingDays: solarPhaseRemaining,
      remaining: solarRemaining,
    },
    lunar: {
      phaseFrac: lunarPhaseFrac,
      node: lunarNode,
      remainingDays: lunarPhaseRemaining,
      remaining: lunarRemaining,
    },
    planets,
    topPlanets,
    axis: axisNormalized,
    edges,
  };
}

function formatRemaining(rem) {
  const parts = [];
  if (rem?.d) parts.push(`${rem.d}d`);
  parts.push(`${rem?.h ?? 0}h`);
  return parts.join(" ").replace(/^0d\s*/, "");
}

function AstrolabeInset({ mode = "compact", state, onJumpToZodiac }) {
  const zodiac = state?.zodiac;
  const solar = state?.solar;
  const lunar = state?.lunar;
  const topPlanets = state?.topPlanets || [];

  if (!state) return null;

  const CardShell = ({ children, className }) => (
    <div className={cx("rounded-3xl border border-gray-800 bg-gray-900/40 p-3", className)}>{children}</div>
  );

  const Compact = () => (
    <CardShell className={"p-3"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] text-emerald-200 font-mono">ASTROLABE • HUD</div>
          <div className="text-[10px] text-gray-400 mt-1">{zodiac?.symbol} {zodiac?.name}</div>
        </div>
        <div className="text-[18px]">⧈</div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-[10px] text-gray-400">Solar node</div>
        <div className="text-[11px] text-emerald-200 font-mono">{solar?.node}/8 • {formatRemaining(solar?.remaining)}</div>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-[10px] text-gray-400">Lunar node</div>
        <div className="text-[11px] text-violet-200 font-mono">{lunar?.node}/6 • {formatRemaining(lunar?.remaining)}</div>
      </div>

      <div className="mt-2">
        <div className="text-[10px] text-gray-400">Influences</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {topPlanets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onJumpToZodiac?.(p.id)}
              className="px-2 py-1 rounded-lg border border-gray-800 bg-gray-950/20 text-[10px] font-mono text-gray-200 hover:text-emerald-200"
            >
              {p.name} • {p.band}
            </button>
          ))}
        </div>
      </div>
    </CardShell>
  );

  const Full = () => (
    <div className="flex flex-col gap-3">
      <CardShell>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[12px] text-emerald-200 font-mono">ASTROLABE • INTERCONNECTIVITY HUD</div>
            <div className="mt-1 text-[10px] text-gray-400">Deterministic wheel: planetary periods → zodiac sector → solar/lunar nodes → V/R/C/W edges</div>
          </div>
          <div className="text-[16px] text-gray-200 font-mono">{zodiac?.symbol} {zodiac?.name}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-gray-800 bg-gray-950/20 p-2">
            <div className="text-[10px] text-gray-400">Solar (8-node wheel)</div>
            <div className="mt-1 text-[14px] text-emerald-200 font-mono">Node {solar?.node}/8</div>
            <div className="text-[10px] text-gray-400">Remaining: {formatRemaining(solar?.remaining)}</div>
          </div>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/20 p-2">
            <div className="text-[10px] text-gray-400">Lunar (6-node wheel)</div>
            <div className="mt-1 text-[14px] text-violet-200 font-mono">Node {lunar?.node}/6</div>
            <div className="text-[10px] text-gray-400">Remaining: {formatRemaining(lunar?.remaining)}</div>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-gray-800 bg-gray-950/20 p-2">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-gray-400">Zodiac sector</div>
            <div className="text-[10px] text-gray-400">Index {state?.zodiacIndex ?? 0}/12</div>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1">
            {ASTRO_ZODIAC.map((z) => {
              const active = z.i === state?.zodiacIndex;
              return (
                <div
                  key={z.i}
                  className={cx(
                    "h-7 rounded-lg flex items-center justify-center text-[10px] font-mono border",
                    active ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200" : "border-gray-800 bg-gray-900/30 text-gray-400"
                  )}
                >
                  {z.symbol}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-gray-400">Planetary bands (by weight)</div>
          <div className="mt-1 flex flex-col gap-2">
            {[...state?.planets || []].sort((a, b) => b.weight - a.weight).map((p) => {
              const pct = Math.round(p.weight * 100);
              const accent = p.bandIdx >= 2 ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-200" : p.bandIdx === 1 ? "bg-amber-500/15 border-amber-500/25 text-amber-200" : "bg-gray-900/30 border-gray-800 text-gray-300";
              return (
                <div key={p.id} className={cx("rounded-2xl border p-2", accent)}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono">{p.name}</div>
                    <div className="text-[10px] font-mono">{p.band}</div>
                    <div className="text-[10px] font-mono">{pct}%</div>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-gray-900/40 overflow-hidden">
                    <div className="h-full bg-emerald-400/70" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="mt-1 text-[9px] text-gray-400 font-mono">Period {p.periodDays}d • Phase {(p.phaseFrac * 360).toFixed(0)}°</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardShell>

      <CardShell>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-gray-200 font-mono">Interconnectivity map</div>
            <div className="text-[10px] text-gray-400 mt-1">Which cycles feed which axes (V/R/C/W). Strength is HUD-local, not astronomical.</div>
          </div>
          <div className="text-[16px]">≋</div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[
            { key: "vitality", label: "V", color: "text-rose-200", bg: "bg-rose-500/10 border-rose-500/25" },
            { key: "resonance", label: "R", color: "text-violet-200", bg: "bg-violet-500/10 border-violet-500/25" },
            { key: "coherence", label: "C", color: "text-emerald-200", bg: "bg-emerald-500/10 border-emerald-500/25" },
            { key: "wisdom", label: "W", color: "text-amber-200", bg: "bg-amber-500/10 border-amber-500/25" },
          ].map((a) => (
            <div key={a.key} className={cx("rounded-2xl border p-2 bg-gray-950/10", a.bg)}>
              <div className={cx("text-[12px] font-mono", a.color)}>{a.label}</div>
              <div className="text-[10px] text-gray-400 mt-1">{Math.round(state.axis?.[a.key] ?? 0)}%</div>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <div className="text-[10px] text-gray-400">Top edges</div>
          <div className="mt-1 flex flex-col gap-2">
            {state.edges.map((e, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-800 bg-gray-950/20 p-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] text-gray-200 font-mono">{e.from}</div>
                  <div className="text-[10px] text-gray-400">→ Axis {e.to}</div>
                  <div className="text-[10px] text-emerald-200 font-mono">{e.strength}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardShell>
    </div>
  );

  return mode === "full" ? <Full /> : <Compact />;
}


function FamiliarSigil({ familiar }) {
  const type = FAMILIAR_TYPES.find((t) => t.id === familiar?.type) || FAMILIAR_TYPES[0];
  const score = fieldScore(familiar);
  const stage = calcEvolutionStage(familiar);
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] text-gray-200 font-mono">FAMILIAR • {type.name}</div>
          <div className="text-[10px] text-gray-400 mt-1">Stage: {stage.label} • Score {Math.round(score)}/100</div>
        </div>
        <div className="text-[30px]" aria-hidden="true">✶</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <SmallStat label="V" value={familiar?.vitality || 0} accent="text-rose-200" />
        <SmallStat label="R" value={familiar?.resonance || 0} accent="text-violet-200" />
        <SmallStat label="C" value={familiar?.coherence || 0} accent="text-emerald-200" />
        <SmallStat label="W" value={familiar?.wisdom || 0} accent="text-amber-200" />
      </div>
    </Card>
  );
}

// ------------------------ Main App ------------------------
export default function CodexV8() {
  const [view, setView] = useState("dashboard");
  const [profile, setProfile] = useState({ name: "Explorer", intention: "Let the matrix speak" });
  const [familiar, setFamiliar] = useState({ type: "ah", vitality: 10, resonance: 10, coherence: 10, wisdom: 10, lastActive: Date.now() });
  const [progress, setProgress] = useState({
    read: {},
    exercises: [],
    sessions: [],
    assessments: [],
    completedRuns: [],
    streakData: { activeDates: [] },
    statHistory: [],
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingEvolution, setPendingEvolution] = useState(null);
  const [toast, setToast] = useState(null);

  const [tabStates, setTabStates] = useState({
    library: { selectedSectionId: ALL_SECTIONS[0]?.id },
    training: { selectedExerciseId: EXERCISES[0]?.id, ritualId: null, runningSession: false },
    assessment: { mode: "formative", sectionId: ALL_SECTIONS[0]?.id, results: null },
    frequency: { intention: "focus", layers: [] },
    familiar: { aiBusy: false, communeText: "", analysis: null },
    dashboard: { },
  });

  const [preOpen, setPreOpen] = useState(false);
  const [postOpen, setPostOpen] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [preState, setPreState] = useState(null);
  const startTimeRef = useRef(null);

  const [runId, setRunId] = useState(null);

  // Load from storage
  useEffect(() => {
    const p = storage.get("profile", null);
    const f = storage.get("familiar", null);
    const pr = storage.get("progress", null);
    const admin = storage.get("isAdmin", null);

    if (p) setProfile(sanitizeProfile(p));
    if (f) {
      const trusted = sanitizeFamiliar(f);
      const decay = calcDecay(trusted.lastActive);
      setFamiliar({
        ...trusted,
        vitality: clamp(trusted.vitality - decay, 0, 100),
        resonance: clamp(trusted.resonance - decay, 0, 100),
        coherence: clamp(trusted.coherence - decay, 0, 100),
        wisdom: clamp(trusted.wisdom - decay, 0, 100),
        lastActive: Date.now(),
      });
    }
    if (pr) setProgress(sanitizeProgress(pr));
    if (admin === "true") setIsAdmin(true);

    const lastView = storage.get("lastView", null);
    if (lastView) setView(normalizeView(lastView));

    const sessionSnap = storage.get("session", null);
    if (sessionSnap && sessionSnap.view) {
      const safeSnap = sanitizeSessionSnapshot(sessionSnap);
      setView(safeSnap.view);
      setTabStates(safeSnap.tabStates);
    }
  }, []);

  // Persist view and session snapshot
  useEffect(() => {
    storage.set("lastView", normalizeView(view));
    const snap = sanitizeSessionSnapshot({ view, tabStates });
    storage.set("session", snap);
  }, [view, tabStates]);

  useEffect(() => {
    storage.set("profile", sanitizeProfile(profile));
  }, [profile]);

  useEffect(() => {
    storage.set("familiar", sanitizeFamiliar(familiar));
  }, [familiar]);

  useEffect(() => {
    storage.set("progress", sanitizeProgress(progress));
  }, [progress]);

  useEffect(() => {
    storage.set("isAdmin", isAdmin ? "true" : "false");
  }, [isAdmin]);

  // Admin unlock: triple tap header title
  const tapTimes = useRef([]);
  const onHeaderTap = () => {
    const now = Date.now();
    tapTimes.current = tapTimes.current.filter((t) => now - t < 900);
    tapTimes.current.push(now);
    if (tapTimes.current.length >= 3) {
      const ok = window?.prompt?.("Admin password?") === "ohm";
      if (ok) {
        setIsAdmin(true);
        setToast({ kind: "ok", msg: "Admin tier unlocked." });
        haptic("light");
      } else {
        setToast({ kind: "bad", msg: "Admin unlock failed." });
        haptic("heavy");
      }
      tapTimes.current = [];
    }
  };

  // Stat helpers
  const todayKey = toDateKey(Date.now());

  const exerciseById = useMemo(() => {
    const map = new Map();
    for (const ex of EXERCISES) map.set(ex.id, ex);
    return map;
  }, []);

  const PITCH_TARGETS = useMemo(() => {
    return {
      nasal_activate: { hz: 110.0, label: "Sphenoid analyzer" },
      phoneme_sequence: { hz: 136.1, label: "Phoneme analyzer" },
    };
  }, []);

  function availableExercises() {
    // Simple rule: Tier 1 always; Tier 2/3 gated by isAdmin.
    // In the handoff doc, logic may differ; scaffold keeps it consistent.
    return EXERCISES.filter((ex) => {
      if (ex.tier <= 1) return true;
      return isAdmin;
    });
  }

  function upsertStreak() {
    const activeDates = progress?.streakData?.activeDates || [];
    if (!activeDates.includes(todayKey)) {
      const next = { ...progress.streakData, activeDates: [...activeDates, todayKey] };
      return next;
    }
    return progress.streakData;
  }

  function calcStreak(activeDates) {
    // activeDates: YYYY-MM-DD strings
    const set = new Set(activeDates);
    const today = new Date();
    const ymd = (d) => toDateKey(d.getTime());
    let current = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      if (set.has(ymd(d))) current++;
      else break;
    }

    // longest
    const sorted = [...set].sort();
    let longest = 0;
    let run = 0;
    let prev = null;
    for (const k of sorted) {
      if (!prev) {
        prev = k;
        run = 1;
      } else {
        const [py, pm, pd] = prev.split("-").map(Number);
        const [cy, cm, cd] = k.split("-").map(Number);
        const prevD = new Date(py, pm - 1, pd);
        const currD = new Date(cy, cm - 1, cd);
        const diff = Math.round((currD - prevD) / 86400000);
        if (diff === 1) run++;
        else run = 1;
        prev = k;
      }
      longest = Math.max(longest, run);
    }
    return { current, longest };
  }

  function handlePreDone(stateData) {
    setPreState(stateData);
    startTimeRef.current = { start: Date.now() };
    setPreOpen(false);
    haptic("light");
    // show running view via training panel state
    setTabStates((s) => ({
      ...s,
      training: { ...s.training, runningSession: true },
    }));
  }

  function handlePostDone({ clarity, calm, energy, note }) {
    setPostOpen(false);
    const ex = activeExercise;
    const start = startTimeRef.current?.start || Date.now();
    const duration = (Date.now() - start) / 1000;

    const planned = ex?.duration != null ? ex.duration : null;

    const stateData = {
      clarity,
      calm,
      energy,
    };

    const exGainField = ex?.statGain;

    // compute runId
    const newRunId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setRunId(newRunId);

    // Update familiar and progress
    setFamiliar((oldF) => {
      const newF = { ...oldF, lastActive: Date.now() };
      const gain = 4; // scaffold gain
      if (exGainField && newF[exGainField] != null) {
        newF[exGainField] = clamp(newF[exGainField] + gain, 0, 100);
      }
      // other stats drift slightly
      newF.vitality = clamp(newF.vitality + (exGainField === "vitality" ? 2 : 1), 0, 100);
      newF.resonance = clamp(newF.resonance + (exGainField === "resonance" ? 2 : 1), 0, 100);
      newF.coherence = clamp(newF.coherence + (exGainField === "coherence" ? 2 : 1), 0, 100);
      newF.wisdom = clamp(newF.wisdom + (exGainField === "wisdom" ? 2 : 0), 0, 100);

      // evolution crossing
      const crossing = checkEvolutionCrossing(oldF, newF);
      if (crossing) setPendingEvolution(crossing);
      return newF;
    });

    setProgress((oldP) => {
      const plannedSeconds = planned != null ? Math.round(planned) : null;
      const pre = preState ? { ...preState } : null;
      const post = { clarity, calm, energy };

      const sessions = [
        ...(oldP.sessions || []),
        {
          date: Date.now(),
          exId: ex?.id || "unknown",
          note: note || "",
          runId: newRunId,
          pre,
          post,
          duration,
          planned: plannedSeconds,
        },
      ];

      const exercisesSet = new Set(oldP.exercises || []);
      if (ex?.id) exercisesSet.add(ex.id);

      const nextP = {
        ...oldP,
        sessions,
        exercises: [...exercisesSet],
        completedRuns: [...(oldP.completedRuns || []), { runId: newRunId, date: Date.now() }],
        streakData: upsertStreak(),
      };

      // stat snapshot: uses updated familiar, but familiar update is async.
      // Scaffold saves after next render by also computing from next snapshot once.
      // We'll do an additional snapshot in an effect keyed by pendingEvolution or last session.
      return nextP;
    });

    // end runtime state
    setTabStates((s) => ({ ...s, training: { ...s.training, runningSession: false, selectedExerciseId: ex?.id } }));
    setActiveExercise(null);
    setPreState(null);
    setToast({ kind: "ok", msg: "Session saved." });
    haptic("light");
  }

  // Save snapshot after session by mirroring familiar state changes.
  const lastSessionCount = useRef(0);
  useEffect(() => {
    const c = progress?.sessions?.length || 0;
    if (c === lastSessionCount.current) return;
    lastSessionCount.current = c;

    // After a new session, push daily snapshot once.
    setProgress((oldP) => {
      const last = oldP?.statHistory?.[oldP.statHistory.length - 1];
      const alreadyToday = last?.date === todayKey;
      if (alreadyToday) return oldP;
      const next = {
        ...oldP,
        statHistory: [
          ...(oldP.statHistory || []),
          { date: todayKey, v: familiar.vitality, r: familiar.resonance, c: familiar.coherence, w: familiar.wisdom },
        ].slice(-90),
      };
      return next;
    });
  }, [progress?.sessions?.length]);

  // Render view
  const navTabs = [
    { id: "dashboard", label: "NEXUS", icon: "⌁" },
    { id: "library", label: "CODEX", icon: "▦" },
    { id: "frequency", label: "", icon: "◈" },
    { id: "training", label: "TRAIN", icon: "⟡" },
    { id: "assessment", label: "ASSESS", icon: "⌬" },
    { id: "familiar", label: "FAMILIAR", icon: "✶" },
  ];

  const training = tabStates.training || {};

  const activeTimer = tabStates.training?.runningSession;
  const [secondsLeft, setSecondsLeft] = useState(0);
  const totalSeconds = activeExercise?.duration || 0;

  // Timer start when runtime begins
  useEffect(() => {
    if (!activeTimer || !activeExercise) return;

    const start = startTimeRef.current?.start || Date.now();
    const plannedMs = (activeExercise.duration || 0) * 1000;

    let raf = 0;
    const tick = () => {
      const elapsed = Date.now() - start;
      const remainingMs = plannedMs - elapsed;
      const left = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(left);
      if (remainingMs <= 0) {
        // finish -> open post
        setSecondsLeft(0);
        setTabStates((s) => ({ ...s, training: { ...s.training, runningSession: false } }));
        setPostOpen(true);
      } else {
        raf = requestAnimationFrame(tick);
      }
    };

    // initialize
    setSecondsLeft(Math.max(0, Math.ceil((plannedMs - (Date.now() - start)) / 1000)));
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeTimer, activeExercise]);

  function startExercise(ex) {
    setActiveExercise(ex);
    setPreOpen(true);
    setPostOpen(false);
    setSecondsLeft(ex.duration);
    haptic("light");
  }

  const streak = calcStreak(progress?.streakData?.activeDates || []);

  const showEvolved = pendingEvolution;

  // FrequencyLab scaffold
  function FrequencyLab() {
    const [intention, setIntention] = useState(tabStates.frequency?.intention || "focus");
    const [layers, setLayers] = useState(tabStates.frequency?.layers || []);

    useEffect(() => {
      setTabStates((s) => ({ ...s, frequency: { ...s.frequency, intention, layers } }));
    }, [intention, layers]);

    const [savedPresets, setSavedPresets] = useState([]);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
      const arr = storage.get("freq_presets", []);
      const actual = sanitizeFrequencyPresets(Array.isArray(arr) ? arr : []);
      setSavedPresets(actual);
      setSavedCount(actual.length);
    }, []);

    const selectPreset = (preset) => {
      setIntention(preset.intention || intention);
      setLayers(Array.isArray(preset.layers) ? preset.layers : []);
      setToast({ kind: "ok", msg: "Preset loaded." });
    };

    const deletePreset = (id) => {
      const next = (savedPresets || []).filter((p) => p.id !== id);
      const safe = sanitizeFrequencyPresets(next);
      storage.set("freq_presets", safe);
      setSavedPresets(safe);
      setSavedCount(safe.length);
      setToast({ kind: "ok", msg: "Preset deleted." });
    };

    const generator = async () => {
      // AI-free deterministic scaffold generator
      // Create 3 layers from intention hash
      const base = intention.toLowerCase().includes("calm") ? 80 : intention.toLowerCase().includes("focus") ? 136.1 : 110;
      const seed = [...intention].reduce((a, c) => a + c.charCodeAt(0), 0);
      const l1 = base;
      const l2 = clamp(base * (1 + (seed % 7) / 70), 40, 400);
      const l3 = clamp(base * (1 + ((seed + 3) % 11) / 90), 25, 500);
      const next = [l1, l2, l3].map((hz, i) => ({ id: `layer_${i}`, hz, gain: clamp(0.6 - i * 0.12, 0.15, 0.9) }));
      setLayers(next);
      setToast({ kind: "ok", msg: "Frequency preset generated (scaffold)." });
    };

    const savePreset = () => {
      const preset = sanitizeFrequencyPreset({ id: `${Date.now()}`, intention, layers });
      const arr = storage.get("freq_presets", []);
      const next = sanitizeFrequencyPresets([...(Array.isArray(arr) ? arr : []), preset]);
      storage.set("freq_presets", next);
      setSavedPresets(next);
      setSavedCount(next.length);
      setToast({ kind: "ok", msg: "Preset saved." });
    };

    const WaveformCanvas = ({ layers }) => {
      return (
        <div className="rounded-lg border border-gray-800 bg-gray-900/40 p-3">
          <div className="text-[11px] text-gray-200">Waveform Canvas (scaffold)</div>
          <div className="mt-2 flex flex-col gap-2">
            {layers.length === 0 ? (
              <div className="text-[10px] text-gray-400">Generate to see active layers.</div>
            ) : (
              layers.map((l) => (
                <div key={l.id} className="flex items-center justify-between gap-3">
                  <div className="text-[11px] text-gray-200 font-mono">{l.hz.toFixed(1)} Hz</div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-500/60" style={{ width: `${clamp(l.gain, 0, 1) * 100}%` }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[12px] text-gray-200 font-mono">FrequencyLab</div>
              <div className="mt-1 text-[10px] text-gray-400">Intention → layers → saved presets • AI-free scaffolded pattern builder</div>
            </div>
            <Badge label={`${savedCount} presets`} variant="muted" />
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-3">
          <Card>
            <div className="text-[10px] text-gray-400 mb-1">Your intention</div>
            <input
              value={intention}
              onChange={(e) => setIntention(e.target.value.slice(0, 50))}
              className="w-full rounded-xl bg-gray-950/20 border border-gray-800 text-[12px] text-gray-200 p-3 outline-none transition focus:border-emerald-400/40 focus:bg-gray-950"
              placeholder="focus, calm, grounding..."
            />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={generator}
                className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono transition hover:bg-emerald-500/25"
              >
                Generate
              </button>
              <button
                type="button"
                onClick={savePreset}
                className="flex-1 py-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-[12px] font-mono transition hover:bg-sky-500/20"
              >
                Save
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <div className="text-[10px] text-gray-400">Saved presets: {savedCount}</div>
              <Badge label="Use load to reuse any preset" variant="muted" />
            </div>
          </Card>

          <Card>
            <div className="text-[11px] text-gray-200">Saved Frequency Presets</div>
            <div className="mt-2 flex flex-col gap-2">
              {savedPresets.length === 0 ? (
                <div className="text-[10px] text-gray-400">No presets saved yet.</div>
              ) : (
                savedPresets.map((preset) => (
                  <div key={preset.id} className="rounded-3xl border border-gray-800 bg-gray-950/20 p-3 shadow-[0_0_0_1px_rgba(148,163,184,0.05)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-[10px] text-gray-200">{preset.intention || "Untitled preset"}</div>
                      <Badge label={`${preset.layers?.length || 0} layers`} variant="accent" />
                    </div>
                    <div className="text-[9px] text-gray-400 mt-1">{preset.layers?.map((l) => l.hz.toFixed(1)).join(" Hz, ")} Hz</div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectPreset(preset)}
                        className="flex-1 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono transition hover:bg-emerald-500/25"
                      >
                        Load
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePreset(preset.id)}
                        className="flex-1 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-[12px] font-mono transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
          <WaveformCanvas layers={layers} />
        </div>
      </div>
    );
  }

  function Dashboard() {
    const score = fieldScore(familiar);
    const stage = calcEvolutionStage(familiar);

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-[12px] text-gray-200 font-mono">NEXUS • {profile.name}</div>
          <div className="mt-1 text-[10px] text-gray-400">Intention: {profile.intention}</div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-400">Evolution stage</div>
              <div className="text-[16px] text-emerald-200 font-mono">{stage.label}</div>
            </div>
            <div className="text-[12px] text-gray-400">Score</div>
            <div className="text-[22px] text-emerald-200 font-mono">{Math.round(score)}</div>
          </div>
        </Card>

        <FamiliarSigil familiar={familiar} />

        <Card>
          <div className="text-[11px] text-gray-200">Today</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <SmallStat label="Streak" value={streak.current} accent="text-amber-200" />
            <SmallStat label="Longest" value={streak.longest} accent="text-violet-200" />
          </div>
          <div className="mt-3 text-[10px] text-gray-400">
            Practice log grows with every saved session. Biometrics are scaffolded for safe runtime.
          </div>
          <button
            type="button"
            onClick={() => setView("training")}
            className="mt-3 w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono"
          >
            Begin Training
          </button>
        </Card>
      </div>
    );
  }

  function Library() {
    const sel = tabStates.library?.selectedSectionId || ALL_SECTIONS[0]?.id;
    const section = ALL_SECTIONS.find((s) => s.id === sel) || ALL_SECTIONS[0];
    const [subSel, setSubSel] = useState(section?.subsections?.[0]?.id || "");

    useEffect(() => {
      const first = section?.subsections?.[0]?.id;
      if (first) setSubSel(first);
    }, [sel]);

    const activeSub = section?.subsections?.find((ss) => ss.id === subSel) || section?.subsections?.[0];

    const evidenceTier = (tier) => {
      if (tier === 1) return { label: "Foundation · Well Established", color: "text-emerald-200" };
      if (tier === 2) return { label: "Intermediate · Partially Established", color: "text-amber-200" };
      return { label: "Advanced · Speculative Territory", color: "text-orange-200" };
    };

    const markRead = () => {
      setProgress((oldP) => {
        const key = `${section.id}.${activeSub.id}`;
        const read = { ...(oldP.read || {}) };
        read[key] = Date.now();
        return { ...oldP, read };
      });
    };

    useEffect(() => {
      // mark read on selection
      markRead();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sel, subSel]);

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-[12px] text-gray-200 font-mono">CODEX Library</div>
          <div className="text-[10px] text-gray-400 mt-1">Choose a section • scroll to read • supports tier labels</div>
        </Card>

        <div className="grid grid-cols-2 gap-2">
          {ALL_SECTIONS.map((s) => {
            const active = s.id === sel;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setTabStates((st) => ({ ...st, library: { ...st.library, selectedSectionId: s.id } }))}
                className={cx(
                  "rounded-xl border p-2 text-left",
                  active ? "border-emerald-500/40 bg-emerald-500/10" : "border-gray-800 bg-gray-900/30"
                )}
              >
                <div className="text-[10px] text-gray-200 font-mono">{s.title}</div>
                <div className="text-[9px] text-gray-400 mt-1">Tier {s.tier}</div>
              </button>
            );
          })}
        </div>

        <Card>
          <div className="text-[11px] text-gray-200 font-mono">{section.title} / {activeSub.title}</div>
          <div className={cx("text-[10px] mt-1", evidenceTier(activeSub.tier || section.tier).color)}>
            {evidenceTier(activeSub.tier || section.tier).label}
          </div>
      <div className="mt-2 flex flex-col gap-2">
            {activeSub.technical ? (
              <TechnicalBodyDisplay technical={activeSub.technical} body={activeSub.body} id={activeSub.id} />
            ) : (
              <div className="text-[12px] text-gray-200 leading-relaxed">{activeSub.body}</div>
            )}
          </div>
          <div className="mt-3">
            <div className="text-[10px] text-gray-400 mb-2">Subsections</div>
            <div className="flex flex-wrap gap-2">
              {section.subsections.map((ss) => {
                const a = ss.id === subSel;
                return (
                  <button
                    key={ss.id}
                    type="button"
                    onClick={() => setSubSel(ss.id)}
                    className={cx(
                      "px-2 py-1 rounded-lg border text-[11px] font-mono",
                      a ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200" : "border-gray-800 bg-gray-950/20 text-gray-300"
                    )}
                  >
                    {ss.title}
                  </button>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  function Training() {
    const candidates = availableExercises();
    const selectedId = training.selectedExerciseId || candidates[0]?.id;
    const selected = candidates.find((c) => c.id === selectedId) || candidates[0];

    const running = training.runningSession;

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-[12px] text-gray-200 font-mono">TRAIN</div>
          <div className="text-[10px] text-gray-400 mt-1">Pick an exercise • complete pre/post to save a session</div>
        </Card>

        <div className="grid grid-cols-1 gap-2">
          {candidates.map((ex) => {
            const active = ex.id === selectedId;
            return (
              <button
                key={ex.id}
                type="button"
                disabled={running}
                onClick={() => setTabStates((st) => ({ ...st, training: { ...st.training, selectedExerciseId: ex.id } }))}
                className={cx(
                  "rounded-xl border p-3 text-left",
                  active ? "border-emerald-500/40 bg-emerald-500/10" : "border-gray-800 bg-gray-900/30",
                  running ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-900/50"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-gray-200 font-mono">{ex.title}</div>
                    <div className="text-[9px] text-gray-400 mt-1">Tier {ex.tier} • {formatSeconds(ex.duration)} • Gain {ex.statGain}</div>
                  </div>
                  <div className="text-[18px]">⟡</div>
                </div>
              </button>
            );
          })}
        </div>

        {selected && !running && (
          <button
            type="button"
            onClick={() => startExercise(selected)}
            className="w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono"
          >
            Begin • {formatSeconds(selected.duration)}
          </button>
        )}
        {selected && running && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-[10px] text-amber-200">
            A session is currently running. Finish or cancel before switching exercises.
          </div>
        )}

        {running && activeExercise && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-gray-200 font-mono">Running • {activeExercise.title}</div>
                <div className="text-[10px] text-gray-400">Planned {formatSeconds(activeExercise.duration)} • measuring scaffold indicators</div>
              </div>
              <CountdownRing secondsLeft={secondsLeft} totalSeconds={activeExercise.duration} />
            </div>

            <DynamicStepFlow stepIndex={1} previewLabel={"Follow cadence"} />

            {/* render biometric placeholder based on exercise id */}
            {activeExercise.id === "breath_entrain" && (
              <BreathCoherenceMeter running={running} />
            )}

            {(activeExercise.id === "nasal_activate" || activeExercise.id === "phoneme_sequence") && (
              <MicrophoneAnalyzer
                running={running}
                targetHz={(PITCH_TARGETS[activeExercise.id]?.hz || 110)}
                label={PITCH_TARGETS[activeExercise.id]?.label || "Analyzer"}
              />
            )}

            {activeExercise.id === "body_scan" && <MicrophoneAnalyzer running={running} targetHz={120} label="Body Scan (zone scaffold)" />}

            {activeExercise.id === "coherence_hold" && <TracingPad running={running} mode="hold" />}

            {activeExercise.id === "rhythm_ground" && <TiltBreathViz running={running} />}

            {activeExercise.id === "phoneme_sequence" && <TracingPad running={running} mode="sequence" />}
          </div>
        )}
      </div>
    );
  }

  function Assessment() {
    const [mode, setMode] = useState(tabStates.assessment?.mode || "formative");
    const [sectionId, setSectionId] = useState(tabStates.assessment?.sectionId || ALL_SECTIONS[0]?.id);
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState(tabStates.assessment?.results || null);

    useEffect(() => {
      setTabStates((s) => ({
        ...s,
        assessment: { ...s.assessment, mode, sectionId, results: result },
      }));
    }, [mode, sectionId, result]);

    const generate = async () => {
      setBusy(true);
      try {
        if (mode === "formative") {
          // Scaffold: deterministic quiz
          const section = ALL_SECTIONS.find((s) => s.id === sectionId) || ALL_SECTIONS[0];
          const qs = section.subsections.slice(0, 2).flatMap((ss) => [
            { q: `What is the primary practice emphasis in “${ss.title}”?`, a: "Timing consistency" },
            { q: `Which evidence tier best matches “${ss.title}” (Foundation / Intermediate / Advanced)?`, a: ss.tier === 1 ? "Foundation" : ss.tier === 2 ? "Intermediate" : "Advanced" },
          ]);
          const formative = {
            mode,
            sectionId,
            score: 90,
            pct: 90,
            questions: qs,
            note: "Scaffold generated formative assessment. Connect AI JSON generator for full behavior.",
          };
          setResult(formative);
          setProgress((oldP) => ({
            ...oldP,
            assessments: [
              ...(oldP.assessments || []),
              { id: `assess-${Date.now()}`, date: Date.now(), sectionId, ...formative },
            ],
          }));
        } else {
          // Summative scaffold
          const summative = {
            mode,
            score: 70,
            pct: 70,
            questions: Array.from({ length: 8 }).map((_, i) => ({ q: `Summative item ${i + 1}: classify claim evidence?`, a: "speculative but interesting" })),
            note: "Scaffold generated summative assessment.",
          };
          setResult(summative);
          setProgress((oldP) => ({
            ...oldP,
            assessments: [
              ...(oldP.assessments || []),
              { id: `assess-${Date.now()}`, date: Date.now(), sectionId, ...summative },
            ],
          }));
        }
      } finally {
        setBusy(false);
      }
    };

    const maybeGainWisdom = () => {
      if (!result || (result.pct ?? 0) < 80) {
        setToast({ kind: "bad", msg: "Score below 80% — no wisdom gain in scaffold." });
        return;
      }
      setFamiliar((old) => {
        const next = { ...old, wisdom: clamp(old.wisdom + 6, 0, 100), lastActive: Date.now() };
        return next;
      });
      setToast({ kind: "ok", msg: "Wisdom gained (pct ≥ 80)." });
    };

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-[12px] text-gray-200 font-mono">ASSESS</div>
          <div className="text-[10px] text-gray-400 mt-1">Scaffold assessment generator + familiar gain rule</div>
        </Card>

        <Card>
          <div className="text-[10px] text-gray-400 mb-2">Mode</div>
          <Segmented
            value={mode}
            options={[
              { value: "formative", label: "Formative" },
              { value: "summative", label: "Summative" },
            ]}
            onChange={setMode}
          />

          {mode === "formative" && (
            <div className="mt-3">
              <div className="text-[10px] text-gray-400 mb-1">Section</div>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full rounded-lg bg-gray-950/20 border border-gray-800 text-[12px] text-gray-200 p-2"
              >
                {ALL_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="mt-4 w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono disabled:opacity-60"
          >
            {busy ? "Generating..." : "Generate Assessment"}
          </button>
        </Card>

        {result && (
          <Card>
            <div className="text-[11px] text-gray-200">Result (scaffold)</div>
            <div className="mt-2 text-[10px] text-gray-400">Mode: {result.mode} • Pct: {result.pct}%</div>
            <button
              type="button"
              onClick={maybeGainWisdom}
              className="mt-3 w-full py-2 rounded-lg bg-gray-950/20 border border-gray-700 text-gray-200 text-[12px] font-mono"
            >
              Apply Gain Rule
            </button>

            <div className="mt-3 flex flex-col gap-2">
              {(result.questions || []).slice(0, 8).map((qq, idx) => (
                <div key={idx} className="rounded-lg border border-gray-800 bg-gray-950/10 p-2">
                  <div className="text-[10px] text-gray-200">Q{idx + 1}: {qq.q}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Answer: {qq.a}</div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-[10px] text-gray-400">{result.note}</div>
          </Card>
        )}
      </div>
    );
  }

  function FamiliarView() {
    const sessions = progress?.sessions || [];
    const last20 = sessions.slice(-20);

    const [communeText, setCommuneText] = useState(tabStates.familiar?.communeText || "What should I practice next?");
    const [analysis, setAnalysis] = useState(tabStates.familiar?.analysis || null);
    const [aiBusy, setAiBusy] = useState(false);

    useEffect(() => {
      setTabStates((s) => ({
        ...s,
        familiar: { ...s.familiar, communeText, analysis, aiBusy },
      }));
    }, [communeText, analysis, aiBusy]);

    const canAnalyze = (sessions?.length || 0) >= 3;

    const runFieldAnalysis = async () => {
      setAiBusy(true);
      try {
        const digest = last20
          .map((ss) => {
            const pre = ss.pre || { clarity: 0, calm: 0, energy: 0 };
            const post = ss.post || { clarity: 0, calm: 0, energy: 0 };
            const dd = {
              clarity: (post.clarity - pre.clarity),
              calm: (post.calm - pre.calm),
              energy: (post.energy - pre.energy),
            };
            return `${new Date(ss.date).toISOString().slice(0, 10)} • ${ss.exId} • ΔC:${dd.clarity}, ΔA:${dd.calm}, ΔE:${dd.energy} • dur:${ss.duration?.toFixed?.(1) || ss.duration}`;
          })
          .join("\n");

        const prompt = `Analyze my last sessions and provide longitudinal insights.\n\nDATA:\n${digest}`;
        const res = await callClaude([{ role: "user", content: prompt }], "Analyst voice. Return plain prose paragraphs.");
        setAnalysis(res.text);
      } finally {
        setAiBusy(false);
      }
    };

    const runAttunement = async () => {
      setAiBusy(true);
      try {
        const type = FAMILIAR_TYPES.find((t) => t.id === familiar.type);
        const prompt = `Attune me in character as ${type?.name}. Keep it grounded and around 70 words. My intention: ${profile.intention}.`;
        const res = await callClaude([{ role: "user", content: prompt }], "Familiar voice." );
        setToast({ kind: "ok", msg: res.text.slice(0, 110) + (res.text.length > 110 ? "…" : "") });
      } finally {
        setAiBusy(false);
      }
    };

    const runCommune = async () => {
      setAiBusy(true);
      try {
        const prompt = `User asks: ${communeText}\n\nRespond in familiar voice, around 90 words, corpus-grounded.`;
        const res = await callClaude([{ role: "user", content: prompt }], "Familiar voice." );
        setToast({ kind: "ok", msg: res.text.slice(0, 140) + (res.text.length > 140 ? "…" : "") });
      } finally {
        setAiBusy(false);
      }
    };

    const FieldTrajectory = ({ statHistory }) => {
      const maxPts = 60;
      const pts = (statHistory || []).slice(-maxPts);
      if (pts.length < 2) {
        return <div className="text-[10px] text-gray-400">Not enough data yet.</div>;
      }

      const w = 340;
      const h = 160;
      const pad = 16;
      const xStep = (w - pad * 2) / (pts.length - 1);

      const y = (v) => {
        const pct = clamp(v / 100, 0, 1);
        return pad + (1 - pct) * (h - pad * 2);
      };

      const pathFor = (key) => {
        return pts
          .map((p, i) => {
            const xx = pad + i * xStep;
            const yy = y(key === "v" ? p.v : key === "r" ? p.r : key === "c" ? p.c : p.w);
            return `${i === 0 ? "M" : "L"} ${xx.toFixed(1)} ${yy.toFixed(1)}`;
          })
          .join(" ");
      };

      return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[180px]" aria-hidden="true">
          <rect x="0" y="0" width={w} height={h} fill="#0b1220" opacity="0.2" />
          <path d={pathFor("v")} stroke="#fb7185" strokeWidth="2" fill="none" />
          <path d={pathFor("r")} stroke="#a78bfa" strokeWidth="2" fill="none" />
          <path d={pathFor("c")} stroke="#34d399" strokeWidth="2" fill="none" />
          <path d={pathFor("w")} stroke="#fbbf24" strokeWidth="2" fill="none" />
        </svg>
      );
    };

    const stage = calcEvolutionStage(familiar);

    return (
      <div className="flex flex-col gap-3">
        <Card>
          <div className="text-[12px] text-gray-200 font-mono">FAMILIAR • {FAMILIAR_TYPES.find((t) => t.id === familiar.type)?.name}</div>
          <div className="text-[10px] text-gray-400 mt-1">Attunement unlocks a voice • analysis unlocks at 3+ sessions</div>
        </Card>

        <FamiliarSigil familiar={familiar} />

        <Card>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={runAttunement}
              disabled={aiBusy}
              className="flex-1 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono disabled:opacity-60"
            >
              Attune
            </button>
            <button
              type="button"
              onClick={() => {
                setToast({ kind: "ok", msg: `Sigil: ${stage.label} • phoneme ${FAMILIAR_TYPES.find((t) => t.id === familiar.type)?.phoneme}` });
              }}
              className="flex-1 py-2 rounded-lg bg-gray-950/20 border border-gray-700 text-gray-200 text-[12px] font-mono"
            >
              Sigil Info
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-[11px] text-gray-200">Commune</div>
          <div className="mt-2">
            <textarea
              value={communeText}
              onChange={(e) => setCommuneText(e.target.value.slice(0, 260))}
              className="w-full min-h-[82px] resize-none rounded-lg bg-gray-950/20 border border-gray-800 text-[12px] text-gray-200 p-2"
            />
          </div>
          <button
            type="button"
            onClick={runCommune}
            disabled={aiBusy}
            className="mt-3 w-full py-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-[12px] font-mono disabled:opacity-60"
          >
            Ask
          </button>
        </Card>

        <Card>
          <div className="text-[11px] text-gray-200">Field Trajectory</div>
          <FieldTrajectory statHistory={progress?.statHistory || []} />
          <div className="mt-2 text-[10px] text-gray-400">Net deltas are computed inside the full version. Scaffold renders stat lines.</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] text-gray-200">Field Analysis</div>
              <div className="text-[10px] text-gray-400 mt-1">Unlocks at 3+ sessions • {canAnalyze ? "Ready" : `Need ${Math.max(0, 3 - sessions.length)} more`}</div>
            </div>
            <button
              type="button"
              onClick={runFieldAnalysis}
              disabled={!canAnalyze || aiBusy}
              className="py-2 px-3 rounded-lg bg-gray-950/20 border border-gray-700 text-gray-200 text-[12px] font-mono disabled:opacity-60"
            >
              {aiBusy ? "Analyzing" : "Analyze"}
            </button>
          </div>

          {analysis && (
            <div className="mt-3 text-[12px] text-gray-200 whitespace-pre-wrap leading-relaxed">{analysis}</div>
          )}
        </Card>

        <Card>
          <div className="text-[11px] text-gray-200">Practice Record</div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <SmallStat label="Sections read" value={Object.keys(progress?.read || {}).length} accent="text-amber-200" />
            <SmallStat label="Exercises saved" value={(progress?.exercises || []).length} accent="text-violet-200" />
          </div>
          <div className="mt-2 text-[10px] text-gray-400">Sessions: {sessions.length}</div>
        </Card>

        <Card>
          <div className="text-[11px] text-gray-200">Lore</div>
          <div className="mt-2 text-[12px] text-gray-200">
            Element: {FAMILIAR_TYPES.find((t) => t.id === familiar.type)?.element} • Phoneme target: {FAMILIAR_TYPES.find((t) => t.id === familiar.type)?.phoneme}
          </div>
        </Card>
      </div>
    );
  }

  const renderView = () => {
    if (view === "dashboard") return <Dashboard />;
    if (view === "library") return <Library />;
    if (view === "frequency") return <FrequencyLab />;
    if (view === "training") return <Training />;
    if (view === "assessment") return <Assessment />;
    if (view === "familiar") return <FamiliarView />;
    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200" style={{ fontFamily: "'Courier New', monospace" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur border-b border-gray-900">
        <div className="max-w-xl mx-auto px-3 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <button type="button" onClick={onHeaderTap} className="text-[12px] text-gray-200 font-mono text-left">
                {APP_NAME}
              </button>
              <div className="text-[10px] text-gray-400 mt-1">
                {isAdmin ? "ADMIN • all tiers unlocked" : "User • tiers gated"} • storage-backed
              </div>
            </div>
            <div className="text-[10px] text-gray-400">{new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-xl mx-auto px-3 pb-24 pt-4">
        {toast && (
          <div className={cx("rounded-lg border p-3 text-[12px] mb-3", toast.kind === "ok" ? "border-emerald-500/30 bg-emerald-500/10" : "border-red-500/30 bg-red-500/10")}>
            {toast.msg}
            <button
              type="button"
              onClick={() => setToast(null)}
              className="float-right text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        )}

        {pendingEvolution && (
          <div className="fixed inset-0 z-50 bg-gray-950/75 flex items-center justify-center p-3">
            <div className="w-full max-w-xl rounded-xl border border-emerald-500/30 bg-gray-900 p-4">
              <div className="text-[12px] text-emerald-200 font-mono">EVOLUTION CROSSING</div>
              <div className="text-[26px] text-gray-100 font-mono mt-2">{pendingEvolution.label}</div>
              <div className="text-[12px] text-gray-400 mt-2">Auto-dismiss in ~7s (scaffold)</div>
              <div className="mt-4 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-emerald-500/60" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
        )}

        {renderView()}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-xl mx-auto bg-gray-950/90 backdrop-blur border-t border-gray-900">
          <div className="flex">
            {navTabs.map((t) => (
              <TabButton key={t.id} active={view === t.id} label={t.label} icon={t.icon} onClick={() => setView(t.id)} />
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreRatingModal
        open={preOpen}
        ex={activeExercise}
        onClose={() => {
          setPreOpen(false);
          setActiveExercise(null);
        }}
        onDone={(stateData) => handlePreDone(stateData)}
      />

      <PostRatingModal
        open={postOpen}
        ex={activeExercise}
        onClose={() => {
          setPostOpen(false);
          setTabStates((s) => ({ ...s, training: { ...s.training, runningSession: false } }));
        }}
        onDone={(stateData) => handlePostDone(stateData)}
      />

      {/* Pending evolution auto-dismiss */}
      {pendingEvolution && (
        <EvolutionAutoDismiss
          onDone={() => setPendingEvolution(null)}
        />
      )}
    </div>
  );
}

function EvolutionAutoDismiss({ onDone }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onDone?.();
    }, 7000);
    return () => clearTimeout(t);
  }, [onDone]);

  return null;
}


