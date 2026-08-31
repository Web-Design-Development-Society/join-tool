# Contributing to join-tool

Quick start for local dev and deployment.

## Prerequisites

- [Deno 2.x](https://docs.deno.com/runtime/getting_started/installation/) (`deno --version` → 2.9+)

## Environment

See [.env.sample](.env.example) and [serverless/.env.example](./serverless/.env.example) for environment variable guides.

- A GitHub OAuth App (`wdd-identifier`) and GitHub App (`wdd-inviter`) installed on `Web-Design-Development-Society` (ask a maintainer for `GITHUB_APP_ID` / `GITHUB_INSTALLATION_ID`)

## Run locally

Two processes (frontend + API):

```bash
# 1. Frontend (Vite) — http://localhost:5173/join-tool
deno run dev
# or: deno task dev  (same: deno run -A --node-modules-dir npm:vite)

# 2. Serverless API — http://localhost:8000 (or 8000 via Deno.serve)
deno task --cwd serverless dev
# = deno run --watch --allow-net --allow-env --env=.env main.ts
# Endpoints: POST /api/invite, GET /api/authenticate?code=...

# Optional: serve built frontend locally like GH Pages
deno run build        # → dist/
deno run preview      # or: deno task serve (serves dist/ at http://0.0.0.0:8000/join-tool)
```

## Build / check

```bash
deno run build                 # Vite build → dist/ (CSS bundled from src/styles.css via import "./styles.css")
deno check src/main.ts         # typecheck
deno check serverless/main.ts
deno lint && deno fmt --check
```

## Deno Deploy Console Access

If you want access to the Deno Deploy workspace `wdd-society`, reach out to Alex Dombroski. There is a `DENO_DEPLOY_TOKEN` in the CI so you may not need it unless updating environment variables.
