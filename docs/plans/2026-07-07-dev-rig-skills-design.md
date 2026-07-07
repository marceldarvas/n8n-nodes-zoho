# Design: Project Skills for Dev-Rig Debugging & Troubleshooting

**Date:** 2026-07-07
**Status:** Approved design, pending implementation
**Goal:** Capture the operational knowledge needed to deploy, smoke-test, and debug this node package on the dev rigs as project-level skills, so any capable model session (Opus-level and up) can continue the work without out-of-band knowledge.

## Problem

The knowledge required to work on this package against live infrastructure — deploy sequences, container names, log-grep patterns, auth quirks, git push workarounds — currently lives in one person's memory and one archived plan document (`docs/plans/archive/2026-07-06-oauth2-refresh-storm-fix.md`). A fresh session cannot deploy or debug without rediscovering it, and has already once mis-deployed (stale files merged by `docker cp`) because a gotcha wasn't recorded.

## Solution

Three focused skills checked into `.claude/skills/<name>/SKILL.md` in this repo. Small skills with sharp trigger descriptions route better than one monolith, and each loads only the tokens its task needs.

### Skill 1: `deploy-to-dev-rig`

**Triggers:** "deploy", "push to the rig", "install the node", "test this on the dev server", post-build verification.

**Content:**
- **Decision guide first:** deploy where the credential lives. The Zoho OAuth credential lives on the **dev server** (n8n-lab / node.overace.agency), so live-API testing must deploy there — a local-only deploy will test stale code against the credential-holding instance.
- **Local rig path:**
  ```bash
  npm run build
  cd /Users/marcel/Developer/Hosting/Apps/n8n/n8n-traefik
  docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d n8n
  ./install-custom-node.sh
  ```
- **Dev server path:** build, tar `dist` + `package.json` + `index.js`, `scp` to `n8n-lab:~/n8n-stack/`, then ssh: **remove the existing `/home/node/.n8n/custom/n8n-nodes-zoho` contents in the container before `docker cp`** (docker cp merges directories; stale `.ts` sources from old installs caused a "fix deployed but still failing" incident), then `docker cp` dist + package.json, `chown -R node:node`, `docker restart n8n-stack-n8n-1`.
- **Verification:** grep container logs for loader errors (`docker logs --since 2m <container> | grep -icE 'error loading|failed to load'`), confirm the deployed version by reading `package.json` inside the container, healthz check.

### Skill 2: `live-debugging`

**Triggers:** "node is failing on the rig", "throttle error", "check executions", "smoke test", OAuth failures at runtime.

**Content:**
- **Docker logs recipes** for both rigs — container names `n8n-traefik-n8n-1` (local) and `n8n-stack-n8n-1` (dev server) — with grep patterns for loader errors, OAuth failures, and Zoho throttle responses.
- **n8n REST API via curl:** list workflows, trigger executions, fetch execution results against the dev server. API key retrieval path is a marked placeholder (`<!-- MARCEL: fill in API key location -->`) until provided.
- **Smoke workflows:** the Bigin smoke workflow (name/ID captured at write time if reachable, placeholder otherwise) and the **run-twice rule** — throttle/refresh fixes must pass two consecutive runs to be confirmed.
- **Zoho error-shape decoder:** `{data:[{code, message, status:"error"}]}` responses, common codes, and the Bigin 3-attempt backoff (revoked refresh tokens slow-fail through it).
- **MCP note:** if an n8n MCP server connected to the dev rig is available in the session, prefer its workflow/execution tools over raw curl; the REST section remains the fallback.

### Skill 3: `codebase-gotchas`

**Triggers:** "why is auth failing", pre-PR checks, starting non-trivial changes in this repo.

**Content:**
- **requestOAuth2 tokenType quirk:** any custom `tokenType` silently degrades n8n's `requestOAuth2` to query-param auth; only the default Bearer header signing works. Never override `tokenType`.
- **Verify call-site inventories with grep** before trusting plan documents (a plan once claimed 3 callers of `getAccessTokenData`; there were 4).
- **Git push workaround:** the SSH agent refuses `id_rsa` for this repo; push with
  `git -c credential.helper='!gh auth git-credential' push https://github.com/marceldarvas/n8n-nodes-zoho.git <branch>`.
- **Known-failing test:** `ZohoBilling.test.ts` organizationId test fails on master (pre-existing); don't attribute it to your change.
- **Open follow-ups from PR #33:** stale `form: qs` / `grant_type` comment in `zohoApiRequest`; ZohoCalendar scope missing from credential defaults; issue #34 (Bigin list ops ignore Limit / Return All not exposed).

## Testing

Per the writing-skills discipline, each skill is validated by a fresh subagent following it against a scenario (e.g. a dry-run of "deploy the current build to the dev server") and checking it needs no out-of-band knowledge. Deploy commands are verified against the archived plan doc; live checks during authoring are read-only (ssh reachability, container names) — no actual deploy unless requested.

## Out of Scope / Follow-ups

- **n8n MCP server on the dev rig:** small follow-up task; the live-debugging skill already carries the "prefer MCP when connected" note so no rewrite is needed when it lands.
- **n8n-as-code (`n8nac`):** GitOps workflow tooling — relevant to the Kiron workflows repo, not this node package. Separate evaluation.
- OAuth2 flow re-architecture, new smoke workflows, CI changes.
- The gotchas skill records traps only; it does not duplicate CLAUDE.md's conventions.

## Open Items

- n8n REST API key location for node.overace.agency — Marcel will provide; skill ships with a marked placeholder until then.
