# ⚽ Live Football Scores

A modern React application for tracking live football matches, scores, and detailed match statistics.

![React](https://img.shields.io/badge/React-19.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Live Dashboard** - View upcoming and live matches with real-time score updates
- **Match Details** - Comprehensive match information including events, lineups, and statistics
- **Date Navigation** - Browse matches by date with an intuitive date picker
- **Auto-Polling** - Automatic score updates every 20 seconds
- **Responsive Design** - Optimized for mobile and desktop devices
- **Dark Theme** - Modern dark UI design

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool & Dev Server |
| React Router | Client-side Routing |
| Tailwind CSS | Styling |
| Axios | HTTP Client |
| date-fns | Date Formatting |
| Lucide React | Icons |

## 📦 Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0+ or **yarn** v1.22.0+

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=/api/v1/json/3

# League IDs
VITE_PREMIER_LEAGUE_ID=4328
```

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | TheSportsDB API base URL | `/api/v1/json/3` |
| `VITE_PREMIER_LEAGUE_ID` | Default league ID (Premier League) | `4328` |

## ▶️ Running the Project

**Development mode:**
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

**Production build:**
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── api/           # API client configuration
├── components/    # Reusable UI components
│   ├── MatchCard.tsx
│   ├── MatchDetails.tsx
│   ├── MatchEvents.tsx
│   ├── MatchHeader.tsx
│   ├── MatchLineups.tsx
│   ├── MatchStats.tsx
│   ├── MatchTabs.tsx
│   └── Navbar.tsx
├── hooks/         # Custom React hooks
│   ├── useMatchDetails.ts
│   └── useMatches.ts
├── lib/           # Utility functions
├── pages/         # Page components
│   ├── Dashboard.tsx
│   └── MatchDetailsPage.tsx
├── services/      # API service layer
├── types.ts       # TypeScript type definitions
├── constants.ts   # App constants
└── main.tsx       # App entry point
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🌐 API Reference

This project uses [TheSportsDB](https://www.thesportsdb.com/api.php) free API.

**Endpoints used:**
- `GET /eventsnextleague.php?id={leagueId}` - Upcoming matches
- `GET /eventspastleague.php?id={leagueId}` - Past matches
- `GET /lookupevent.php?id={eventId}` - Match details

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:

- How to submit bug reports and feature requests
- Development setup and workflow
- Coding standards and best practices
- Pull request process

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔒 Security

For security concerns, please review our [Security Policy](SECURITY.md).

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## 🙏 Acknowledgments

- [TheSportsDB](https://www.thesportsdb.com/) for providing the free sports API
- [Lucide](https://lucide.dev/) for the beautiful icons
- All contributors who help improve this project

## 📞 Support

- 📫 Create an [issue](https://github.com/yourusername/live-football-scores/issues) for bug reports or feature requests
- 💬 Start a [discussion](https://github.com/yourusername/live-football-scores/discussions) for questions
- ⭐ Star this repo if you find it helpful!

---

Built with ❤️ using React + TypeScript
