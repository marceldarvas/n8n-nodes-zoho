---
name: live-debugging
description: Troubleshoot this node package running on the n8n dev rigs — read container logs, trigger the smoke workflow, inspect executions, decode Zoho API errors. Use when the node is "failing on the rig", on throttle/OAuth errors at runtime, when asked to "smoke test" or "check executions".
---

# Live Debugging on the Dev Rigs

Two rigs. The Zoho OAuth credential lives on the **dev server** — live-API
failures can only be reproduced there.

| Rig | Container | Access |
|-----|-----------|--------|
| Local | `n8n-traefik-n8n-1` | direct `docker` commands |
| Dev server (node.overace.agency) | `n8n-stack-n8n-1` | `ssh n8n-lab '…'` (passwordless) |

## Reading logs

```bash
# Dev server — recent errors
ssh n8n-lab 'docker logs --since 10m n8n-stack-n8n-1 2>&1 | grep -iE "error|throttle|unauthorized|ECONNREFUSED"'

# Loader problems after a deploy (node fails to register)
ssh n8n-lab 'docker logs --since 5m n8n-stack-n8n-1 2>&1 | grep -iE "error loading|failed to load"'

# Local rig: same greps, drop the ssh wrapper, container n8n-traefik-n8n-1
```

What to look for:
- `error loading` / `failed to load` — bad deploy (stale/missing dist files); redeploy per the `deploy-to-dev-rig` skill.
- `401` / `unauthorized` — OAuth signing problem; see the `codebase-gotchas` skill (tokenType quirk) before touching credential code.
- Zoho throttle messages — see run-twice rule below.

## Smoke test (dev server)

The smoke workflow exercises Bigin against live Zoho. ID `ls4wQp0tx7p2Kw0Q`
(named "My workflow" in the UI).

```bash
# Only if execute errors with an unknown-workflow message: re-list and pick
# the row named "My workflow" (format: <id>|<name>)
ssh n8n-lab 'docker exec n8n-stack-n8n-1 n8n list:workflow'

# Trigger a run via the n8n CLI — no API key needed
ssh n8n-lab 'docker exec n8n-stack-n8n-1 n8n execute --id ls4wQp0tx7p2Kw0Q'; echo "exit: $?"
```

Success criteria (check BOTH — do not eyeball):
1. Exit code 0.
2. Output contains no `"status":"error"` and no `NodeApiError`/`NodeOperationError`:
   `... | grep -cE '"status":\s*"error"|NodeApiError|NodeOperationError'` → expect 0.

Failures include the Zoho error body — decode it with the section below.
(Exact output shape unverified as of 2026-07-08 — confirm on first use and
tighten this section if it differs.)

**Run-twice rule:** token-refresh and throttle fixes MUST pass two consecutive
runs. The first run can succeed on a cached token; the second exposes
refresh-path bugs.

## n8n REST API (execution history)

The CLI covers triggering; the REST API adds execution history and richer
filtering. Base URL: `https://node.overace.agency/api/v1`, header
`X-N8N-API-KEY: <key>`.

<!-- MARCEL: fill in API key location (env var on n8n-lab? 1Password?) -->

```bash
curl -s -H "X-N8N-API-KEY: $N8N_API_KEY" \
  'https://node.overace.agency/api/v1/executions?workflowId=ls4wQp0tx7p2Kw0Q&limit=5'
```

If an n8n MCP server connected to this instance is available in the session,
prefer its workflow/execution tools over raw curl.

## Decoding Zoho errors

Bigin/CRM error shape:

```json
{"data": [{"code": "INVALID_TOKEN", "message": "...", "status": "error"}]}
```

Common cases:
- `INVALID_TOKEN` / 401 — access token rejected. If it recurs after refresh, suspect the signing path (see `codebase-gotchas`: tokenType quirk).
- "too many requests" / throttle — Zoho rate limit, usually from a token-refresh storm. Check whether every request is refreshing (should NOT be — refresh goes through n8n's `requestOAuth2`).
- Billing/Subscriptions errors return `{code, message}` at the top level instead.

**Backoff caveat:** Bigin requests retry 3 times with backoff. A revoked
refresh token therefore fails *slowly* (~3 attempts per call) — a workflow
that suddenly takes much longer before erroring often means dead credentials,
not a performance bug.
