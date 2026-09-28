# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-09-28

### Added

- **Live scores page** (`/live`) covering every competition the provider serves,
  with status filters, search and competition grouping.
- **Complete league standings** — all 20 Premier League clubs and all 36
  Champions League league-phase clubs, with form guide and provider-defined
  qualification zones.
- **Match analytics** — timeline, expected goals (xG/xGOT/xA), possession, shot
  breakdown, per-player ratings, formations, and real bookmaker odds with
  opening-price drift.
- **Team profiles** backed by the metered provider, including crest, stadium and
  a deduplicated squad list.
- **Serverless API proxy** (`api/`) with a route allowlist, TTL cache,
  stale-while-error fallback, in-flight deduplication, per-IP rate limiting, a
  hard request budget, and a capability registry.
- **Diagnostics endpoint** at `/api/sportdb/__status`, reporting budget, cache
  statistics and per-feature availability without an upstream call.
- **CI workflow** running lint, application type-check, serverless type-check,
  build, and a secret scan.
- `docs/ARCHITECTURE.md` documenting the design and its constraints.

### Changed

- Standings are now responsive at every breakpoint: all columns remain visible,
  with the rank and team columns pinned during horizontal scroll.
- Design tokens reworked around an emerald accent on a deep slate background.
- Match sub-resources load lazily per tab, reducing a match view from four
  upstream requests to one in the common case.
- `npm run build` now type-checks the serverless functions before building.

### Fixed

- Three incorrect league identifiers that resolved to entirely different sports
  (Champions League, Europa League and the Argentine top flight).
- Serverless functions failed to compile on the deployment platform while the
  build still reported success, leaving the API silently absent.
- Multi-segment proxy paths returned a platform `404` because the filename-based
  catch-all matched only one segment when rewrites were declared.
- Duplicate standings rows caused by merging the previous season's teams without
  deduplication.
- The favourites badge never rendered, because `favoritesCount` was missing from
  the context value.

### Removed

- **Fabricated data.** Randomly generated standings rows, hash-derived
  "bookmaker" odds, and generated basketball play-by-play built from
  `Math.random()` and hardcoded player names have all been deleted. Missing data
  is now shown as missing.
- Unused Dualite tooling, dead components, orphaned types and unused exports.

### Security

- Provider credentials are server-only and verified absent from the client
  bundle and from git history; CI now asserts both.
- `.env` and build output removed from version control and added to
  `.gitignore`.

[Unreleased]: https://github.com/letera1/Sport-Web/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/letera1/Sport-Web/releases/tag/v1.0.0
