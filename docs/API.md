# API Reference

The application reads from two providers. This document covers both, and the
proxy that fronts the metered one.

## Contents

- [Provider summary](#provider-summary)
- [Serverless proxy](#serverless-proxy)
- [Allowlisted routes](#allowlisted-routes)
- [Response envelope](#response-envelope)
- [Error codes](#error-codes)
- [Diagnostics](#diagnostics)
- [Keyless provider](#keyless-provider)
- [Verified response shapes](#verified-response-shapes)

## Provider summary

| | TheSportsDB | SportDB.dev |
| --- | --- | --- |
| **Base** | `https://www.thesportsdb.com/api/v1/json/3` | `https://api.sportdb.dev` |
| **Auth** | None | `X-API-Key` header |
| **Reached via** | `vercel.json` rewrite, direct from browser | `/api/sportdb/*` serverless proxy |
| **Cost** | Free | Metered per month |
| **Used for** | Fixtures by date, player/team lookup, crest fallback | Live feed, full standings, match analytics, squads |

## Serverless proxy

```
GET /api/sportdb/{namespace}/{...path}
```

The browser never sends a credential. The proxy injects `X-API-Key` server-side
and forwards only paths that appear on the allowlist.

Constraints applied to every request:

- `GET` only — any other method returns `405`
- Between 2 and 6 path segments
- Each segment at most 64 characters, and never `.` or `..`
- Only the `page` query parameter is forwarded upstream; everything else is dropped

## Allowlisted routes

Requests that do not match one of these patterns are rejected with `404` before
any upstream call is made.

### `flashscore` namespace

| Route | Feature | Cache TTL |
| --- | --- | --- |
| `flashscore/{sport}/live` | `live` | 45 s |
| `flashscore/{sport}/{country}/{competition}` | `competition` | 7 d |
| `flashscore/{sport}/{country}/{competition}/live` | `competitionLive` | 45 s |
| `flashscore/{sport}/{country}/{competition}/{season}/standings` | `standings` | 2 h |
| `flashscore/{sport}/{country}/{competition}/{season}/fixtures` | `fixtures` | 6 h |
| `flashscore/{sport}/{country}/{competition}/{season}/results` | `results` | 2 h |
| `flashscore/match/{eventId}/details` | `matchDetails` | 2 min |
| `flashscore/match/{eventId}/lineups` | `matchLineups` | 30 min |
| `flashscore/match/{eventId}/stats` | `matchStats` | 2 min |
| `flashscore/match/{eventId}/odds` | `matchOdds` | 30 min |
| `flashscore/match/{eventId}/playerstats` | `matchPlayerStats` | 10 min |
| `flashscore/team/{slug}/{teamId}` | `team` | 3 d |

### `transfermarkt` namespace

| Route | Feature | Cache TTL |
| --- | --- | --- |
| `transfermarkt/players/{id}/{profile\|transfers\|stats}` | `transfermarkt` | 3 d |

### Parameter rules

| Parameter | Rule |
| --- | --- |
| `{sport}` | Must appear in `SPORTDB_ALLOWED_SPORTS` (default: `football` only) |
| `{season}` | `YYYY` or `YYYY-YYYY`. Single-year form is required by MLS, Brazil and Argentina |
| `{eventId}` | Provider-issued identifier |
| `{page}` | Integer, `fixtures` and `results` only |

> Competition endpoints are self-describing: the response lists its own available
> seasons and the exact paths for their standings, fixtures and results. Read the
> season from there rather than constructing it.

### Examples

```bash
curl https://livefootballscores.vercel.app/api/sportdb/flashscore/football/live

curl https://livefootballscores.vercel.app/api/sportdb/flashscore/football/england/premier-league

curl https://livefootballscores.vercel.app/api/sportdb/flashscore/football/england/premier-league/2026-2027/standings
```

## Response envelope

Successful responses wrap the upstream payload and carry cache provenance:

```json
{
  "data": [ /* upstream payload, unmodified */ ],
  "meta": {
    "feature": "standings",
    "cached": true,
    "stale": false,
    "ageMs": 41230,
    "fetchedAt": "2026-09-28T09:12:53.699Z"
  }
}
```

`stale: true` means the upstream call failed and a cached copy beyond its TTL was
served instead, within a six-hour grace window. The UI can surface this rather
than showing an error.

## Error codes

```json
{ "error": { "code": "unknown_endpoint", "message": "..." } }
```

| Code | HTTP | Meaning |
| --- | --- | --- |
| `unknown_endpoint` | 404 | Path is not on the allowlist |
| `not_configured` | 503 | No API key set; no upstream call attempted |
| `feature_unavailable` | 403 | Plan does not include this feature; suppressed to avoid waste |
| `budget_exhausted` | 429 | Local request ceiling reached |
| `rate_limited` | 429 | Per-IP limit against this proxy |
| `upstream_rate_limited` | 429 | Provider returned 429 |
| `upstream_unavailable` | 502 | Provider unreachable or returned 5xx |
| `method_not_allowed` | 405 | Non-`GET` request |

> **Diagnostic tip:** a `404` carrying the JSON body above means the function ran
> and rejected the path. A `404` returning the platform's HTML `NOT_FOUND` page
> means the request never reached the function — that is a routing problem, not
> an application one.

## Diagnostics

```bash
curl https://livefootballscores.vercel.app/api/sportdb/__status
```

Returns configuration state, remaining budget, cache statistics and per-feature
availability. It never triggers an upstream call, so it is safe to poll.

```json
{
  "configured": true,
  "health": "healthy",
  "budget": { "used": 41, "budget": 800, "remaining": 759, "exhausted": false },
  "providerQuota": { "plan": "free", "quota": 1000, "usedThisMonth": 41 },
  "features": [{ "id": "live", "state": "available", "ttlMs": 45000 }]
}
```

## Keyless provider

Reached through a rewrite, so no credential is involved.

| Endpoint | Purpose |
| --- | --- |
| `eventsday.php?d={date}&l={league}` | Fixtures for a date |
| `lookupevent.php?id={id}` | Match detail |
| `lookuptimeline.php?id={id}` | Match timeline |
| `lookuplineup.php?id={id}` | Lineups |
| `lookuptable.php?l={league}&s={season}` | League table — **top 5 rows only** |
| `lookupteam.php?id={id}` | Team detail |
| `lookup_all_players.php?id={id}` | Squad |
| `searchplayers.php?p={name}` | Player search |

### Known free-tier limitations

These are provider caps, not defects in this codebase:

- `lookuptable.php` returns **only the top five rows**, for every league and season.
- `search_all_teams.php` returns **10 of 20** clubs for the Premier League.
- `searchteams.php` returns **a single result**, often from the wrong sport for
  short names.
- `lookup_all_teams.php` **ignores its `id` parameter** and returns an unrelated
  list. It must not be used for league filtering.
- Champions League and Europa League have **no table at all** — the endpoint
  returns `200` with an empty body.

The app handles each of these by degrading visibly rather than padding the gap.

## Verified response shapes

Captured from live responses, not from vendor documentation.

**Standings row** — `rank`, `teamName`, `teamId`, `teamSlug`, `matches`, `wins`,
`draws`, `points`, `goalDiff`, `goals`, `rankClass`, `rankColor`, `events[]`.

- `goals` is `"scored:conceded"`, e.g. `"8:1"` — split on `:`.
- Losses have no single usable field; derive `matches - wins - draws`.
- `rankClass` is the provider's own qualification marker (`q1` Champions, other
  `q*` Europa, `r*` relegation). Use it rather than hardcoding rank thresholds,
  since it adapts per competition.
- Form comes from `events[].eventType`, already expressed per team as
  `"w" | "d" | "l" | "upcoming"`.
- Standings rows contain **no crest** — logos require a separate `team` lookup.

**Match stats** — grouped by period (`Match`, `1st Half`, `2nd Half`). Includes
xG, xGOT, xA, big chances, and passing accuracy as `"80% (274/344)"`. The `Match`
period repeats its headline metrics before the full list, so deduplicate by
`statId`.

**Match lineups** — three groups: `Starting Lineups`, `Substitutes`, `Coaches`.
Formation and team rating are repeated on every player object; read the first.

**Match odds** — bookmaker × scope × market. For the full-time 1X2 market the
three entries arrive as `[home, away, draw]`, where the draw is identified by a
`null` participant id. `opening` versus `value` gives price drift.

**Match details** — venue, city, capacity, referee and a timeline. It carries
**no score**, and the timeline is frequently empty even for finished matches.
