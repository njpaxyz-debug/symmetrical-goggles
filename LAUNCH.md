# 🚀 Codex v8 — Launch Instructions

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run validate:codex-v8` | Validate JSX syntax |

---

## App Overview

**Codex v8** is a frequency training & familiar evolution scaffold with:

- **FrequencyLab**: Generate, save, and load frequency presets for different intentions (focus, calm, grounding)
- **Training**: Time-based exercises with pre/post-session flows
- **Assessment**: Feedback collection with progression tracking
- **Familiar Companion**: AI-free familiar evolution system with ritual tracking

### Storage

- All data persists to `localStorage` (or Claude sandbox `window.storage` if available)
- Data is sanitized on read and write for security
- Manual export/import via JSON in settings

### Mobile-First Design

The app uses Tailwind CSS with mobile-first responsive breakpoints and supports dark theme by default.

---

## Architecture

- **Single-file React app**: `app/codex-v8.jsx`
- **No backend required**: Fully client-side
- **Validation**: `npm run validate:codex-v8` checks JSX syntax
- **Build tool**: Vite with React plugin

---

## Development Notes

- Modify `app/codex-v8.jsx` directly for feature changes
- Tailwind classes are streamed from CDN in development
- Hot reload is active; changes refresh automatically

Enjoy building! 🎯
