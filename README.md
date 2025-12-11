# Live Football Scores

A React + TypeScript application for tracking live football matches, scores, and match details using TheSportsDB API.

## Tech Stack

- React 19 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Tailwind CSS (styling)
- Axios (API requests)
- date-fns (date formatting)
- Lucide React (icons)

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Installation

1. Clone or extract the project:
```bash
cd <project-folder>
```

2. Install dependencies:
```bash
npm install
```

## Running the Project

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Features

- Dashboard with live/upcoming matches
- Date picker to browse matches by date
- Match details with Events, Lineups, Stats tabs
- Auto-polling for live score updates (20s interval)
- Responsive design (mobile & desktop)
- Dark theme UI

## API

Uses [TheSportsDB](https://www.thesportsdb.com/) free API for match data.
