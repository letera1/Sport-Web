# Deployment

The project targets **Vercel**, which serves the static build and hosts the
functions in `api/`.

> **Static-only hosts will not work.** GitHub Pages, S3 and similar cannot run
> the serverless proxy, so the metered provider's features — live scores, full
> standings and match analytics — would be unavailable. A platform with
> serverless function support is required.

## Contents

- [Prerequisites](#prerequisites)
- [First deployment](#first-deployment)
- [Environment variables](#environment-variables)
- [Routing](#routing)
- [Verifying a deployment](#verifying-a-deployment)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Run the full check locally first. This is exactly what CI runs:

```bash
npm run verify
```

It must exit `0` before you deploy.

## First deployment

```bash
npm i -g vercel
vercel login
vercel link
vercel --prod
```

Subsequent pushes to `main` deploy automatically once the repository is
connected.

### Project settings

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm ci` |
| Node version | 22.x |

## Environment variables

Set these in **Project → Settings → Environment Variables**, for the Production
environment at minimum.

| Variable | Required | Notes |
| --- | --- | --- |
| `SPORTDB_API_KEY` | Yes, for live data | Server-only. Must **not** be prefixed `VITE_`. |
| `SPORTDB_REQUEST_BUDGET` | No | Defaults to `800` |
| `SPORTDB_ALLOWED_SPORTS` | No | Defaults to `football` |
| `SPORTDB_RL_MAX` | No | Per-IP requests per minute, defaults to `30` |

A `VITE_` prefix would inline the value into the browser bundle. The key must
never carry one.

### Verifying the key never ships to the client

```bash
npm run build
grep -r "SPORTDB_API_KEY" dist/        # expect no matches
grep -r "api.sportdb.dev" dist/        # expect no matches
```

Re-run this after any change to the client data layer.

## Routing

`vercel.json` rewrites are order-sensitive:

```jsonc
{
  "rewrites": [
    // Must come first, and must not be swallowed by the rule below.
    { "source": "/api/sportdb/(.*)", "destination": "/api/sportdb-proxy?path=$1" },

    // Everything else under /api goes to the keyless provider.
    { "source": "/api/((?!sportdb).*)", "destination": "https://www.thesportsdb.com/api/$1" },

    // SPA fallback, excluding /api and the image hosts.
    { "source": "/((?!api|images-r2|images-www|images-proxy).*)", "destination": "/index.html" }
  ]
}
```

The negative lookahead in the second rule is what keeps proxy traffic away from
the keyless provider. Removing it silently breaks every SportDB feature.

### Why the proxy uses an explicit rewrite

A filename-based catch-all (`api/sportdb/[...path].ts`) is the conventional
approach, but with `rewrites` declared in `vercel.json` the platform matched only
a **single** path segment — `/api/sportdb/a` reached the function while
`/api/sportdb/a/b` returned a platform `404`. The static route plus explicit
rewrite above removes the dependency on dynamic-route detection entirely.

## Verifying a deployment

```bash
# 1. Proxy is alive and configured
curl https://<your-domain>/api/sportdb/__status

# 2. A multi-segment path resolves (this is what the catch-all bug broke)
curl -o /dev/null -w "%{http_code}\n" \
  https://<your-domain>/api/sportdb/flashscore/football/live

# 3. The keyless provider still routes
curl -o /dev/null -w "%{http_code}\n" \
  https://<your-domain>/api/v1/json/3/all_leagues.php
```

All three should return `200`, and `__status` should report
`"configured": true`.

To check which commit is live without opening the dashboard, read the commit
status from GitHub:

```bash
gh api repos/<owner>/<repo>/commits/<sha>/status --jq '.statuses[]|{context,state,target_url}'
```

## Troubleshooting

### The site deploys but the API returns 404

Check the response body:

- **JSON `{"error":{"code":"unknown_endpoint"}}`** — the function ran and
  rejected the path. The path is not on the allowlist, or segments arrived empty.
- **HTML `NOT_FOUND`** — the request never reached the function. This is a
  routing problem; check the rewrite order in `vercel.json`.

### The build succeeds but functions are missing

Vercel logs TypeScript errors for `api/` and then **still reports "Build
Completed"**, deploying without the function. A green deployment is not proof
that the functions compiled.

Guard against this locally and in CI:

```bash
npm run typecheck:api
```

Two failure modes account for most occurrences:

- **`TS2835: Relative import paths need explicit file extensions`** — because
  `package.json` sets `"type": "module"`, `api/` uses Node16 resolution and
  relative imports need a `.js` suffix, even from `.ts` files.
- **`TS2339: Property does not exist`** on a union — Vercel compiles without
  `strict`, so narrowing that relies on strict-mode behaviour fails there while
  passing locally. `api/tsconfig.json` pins the settings to match.

### The deployed site shows stale code

Compare the served bundle against a local build:

```bash
npm run build
ls dist/assets/                                   # local hash
curl -s https://<your-domain>/ | grep -o 'assets/index-[A-Za-z0-9_-]*\.js'
```

If they differ, the newest commit has not deployed. Check for cancelled builds —
rapid consecutive pushes cancel in-flight deployments.

### Preview URLs redirect to a login page

`*-git-<branch>-*.vercel.app` domains have Deployment Protection enabled by
default and return a `302` to an authentication page. Test against the
production domain instead; an authenticated redirect can otherwise look like the
API returning HTML.
