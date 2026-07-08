# Dev-Rig Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create three project skills (`deploy-to-dev-rig`, `live-debugging`, `codebase-gotchas`) under `.claude/skills/` so any capable model session can deploy, smoke-test, and debug this node package on the dev rigs without out-of-band knowledge.

**Architecture:** Each skill is a single `SKILL.md` with YAML frontmatter (name + trigger-rich description) in its own directory. Content is command-block-first: copy-paste sequences with expected output, verified against the live rigs at plan-authoring time. Validation is behavioral: a fresh subagent must answer scenario questions using only the skill text.

**Tech Stack:** Claude Code project skills (markdown), bash/ssh/docker commands. No code changes to the node package itself.

**Spec:** `docs/plans/2026-07-07-dev-rig-skills-design.md`

**Facts verified live on 2026-07-08:**
- Local rig: `/Users/marcel/Developer/Hosting/Apps/n8n/n8n-traefik/` exists with `install-custom-node.sh` and `docker-compose.dev.yaml`; container `n8n-traefik-n8n-1` running.
- Dev server: `ssh n8n-lab` works passwordless; container `n8n-stack-n8n-1` running; staging dir `~/n8n-stack/` exists (prior artifacts: `zoho-deploy/`, `zoho-node.tgz`).
- Smoke workflow on dev server: ID `ls4wQp0tx7p2Kw0Q`, currently named "My workflow".
- `docker exec n8n-stack-n8n-1 n8n list:workflow` and `n8n execute --id <id>` work without an API key.

---

### Task 1: `deploy-to-dev-rig` skill

**Files:**
- Create: `.claude/skills/deploy-to-dev-rig/SKILL.md`

- [x] **Step 1: Create the skill file with this exact content**

````markdown
---
name: deploy-to-dev-rig
description: Build and deploy this node package to the n8n dev rigs and verify the deploy landed. Use when asked to "deploy", "push to the rig", "install the node", "test this on the dev server", or after any build that must be exercised against live Zoho APIs.
---

# Deploy to Dev Rig

## Decision guide: which rig?

**Deploy where the credential lives.** The Zoho OAuth credential lives on the
**dev server** (n8n-lab / node.overace.agency). Any test that must hit live
Zoho APIs requires a dev-server deploy — a local-only deploy leaves the
credential-holding instance running stale code (this exact mistake once caused
a "fix deployed but still failing" incident).

| Target | Container | Use for |
|--------|-----------|---------|
| Local rig | `n8n-traefik-n8n-1` | Loader/compile checks, UI param inspection |
| Dev server | `n8n-stack-n8n-1` | Anything touching live Zoho APIs |

## Local rig

```bash
cd /Users/marcel/Projects/Kiron/n8n-kiron/nodes/n8n-nodes-zoho && npm run build
cd /Users/marcel/Developer/Hosting/Apps/n8n/n8n-traefik
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d n8n
./install-custom-node.sh
```

The script performs its own checks ("Compiled files found", container
restarts, healthz ok). Then verify:

```bash
docker logs --since 2m n8n-traefik-n8n-1 2>&1 | grep -icE 'error loading|failed to load'
# Expected: 0
```

## Dev server (n8n-lab / node.overace.agency)

**CRITICAL:** `docker cp` MERGES into existing directories — it does not
replace them. Old installs left stray `.ts` sources in the container; copying
over them once produced a deploy that silently kept running the old version.
Always clear the target directory inside the container first. The sequence
below moves the old install aside (to `/tmp` — NOT to a sibling `.bak` inside
`custom/`, which n8n would try to load as a second package) so a failed copy
can be rolled back.

```bash
cd /Users/marcel/Projects/Kiron/n8n-kiron/nodes/n8n-nodes-zoho && npm run build
tar -czf /tmp/zoho-node.tgz dist package.json index.js
scp /tmp/zoho-node.tgz n8n-lab:~/n8n-stack/
ssh n8n-lab '
  cd ~/n8n-stack &&
  rm -rf zoho-deploy && mkdir zoho-deploy &&
  tar -xzf zoho-node.tgz -C zoho-deploy &&
  test -f zoho-deploy/package.json && test -d zoho-deploy/dist &&
  docker exec n8n-stack-n8n-1 sh -c "rm -rf /tmp/zoho-prev; mv /home/node/.n8n/custom/n8n-nodes-zoho /tmp/zoho-prev 2>/dev/null; mkdir -p /home/node/.n8n/custom/n8n-nodes-zoho" &&
  docker cp zoho-deploy/dist n8n-stack-n8n-1:/home/node/.n8n/custom/n8n-nodes-zoho/dist &&
  docker cp zoho-deploy/package.json n8n-stack-n8n-1:/home/node/.n8n/custom/n8n-nodes-zoho/package.json &&
  docker cp zoho-deploy/index.js n8n-stack-n8n-1:/home/node/.n8n/custom/n8n-nodes-zoho/index.js &&
  docker exec -u root n8n-stack-n8n-1 chown -R node:node /home/node/.n8n/custom &&
  docker restart n8n-stack-n8n-1
'
```

**Rollback** (if the copy failed and the node is gone):

```bash
ssh n8n-lab 'docker exec n8n-stack-n8n-1 sh -c "rm -rf /home/node/.n8n/custom/n8n-nodes-zoho && mv /tmp/zoho-prev /home/node/.n8n/custom/n8n-nodes-zoho" && docker restart n8n-stack-n8n-1'
```

The previous install stays at `/tmp/zoho-prev` in the container until the next
deploy overwrites it (or the container recreates); no cleanup step needed.

## Verify the deploy landed

```bash
# 1. Version inside the container matches package.json here
ssh n8n-lab 'docker exec n8n-stack-n8n-1 cat /home/node/.n8n/custom/n8n-nodes-zoho/package.json' | grep '"version"'

# 2. No loader errors after restart (wait ~20s for boot)
ssh n8n-lab 'docker logs --since 2m n8n-stack-n8n-1 2>&1 | grep -icE "error loading|failed to load"'
# Expected: 0

# 3. Instance is up
curl -sf https://node.overace.agency/healthz && echo OK
```

For local-rig verification, replace the ssh wrapper with direct `docker`
commands against `n8n-traefik-n8n-1`.

## After deploying

Run the smoke test — see the `live-debugging` skill. Throttle/auth fixes must
pass **two consecutive runs** to count as confirmed.
````

- [x] **Step 2: Verify skill file parses (frontmatter + name matches directory)**

Run: `head -5 .claude/skills/deploy-to-dev-rig/SKILL.md`
Expected: frontmatter opens with `---`, `name: deploy-to-dev-rig`.

- [x] **Step 3: Commit**

```bash
git add .claude/skills/deploy-to-dev-rig/SKILL.md
git commit -m "feat: add deploy-to-dev-rig skill"
```

---

### Task 2: `live-debugging` skill

**Files:**
- Create: `.claude/skills/live-debugging/SKILL.md`

- [x] **Step 1: Create the skill file with this exact content**

````markdown
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
# List workflows (confirm ID if it changed)
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
````

- [x] **Step 2: Verify frontmatter**

Run: `head -5 .claude/skills/live-debugging/SKILL.md`
Expected: `name: live-debugging`.

- [x] **Step 3: Commit**

```bash
git add .claude/skills/live-debugging/SKILL.md
git commit -m "feat: add live-debugging skill"
```

---

### Task 3: `codebase-gotchas` skill

**Files:**
- Create: `.claude/skills/codebase-gotchas/SKILL.md`

- [x] **Step 1: Create the skill file with this exact content**

````markdown
---
name: codebase-gotchas
description: Known traps in this repo that are not visible from the code — OAuth tokenType quirk, git push workaround, known-failing test, open follow-ups. Read when starting any non-trivial change, when auth mysteriously fails, or before opening a PR.
---

# Codebase Gotchas

## requestOAuth2 tokenType quirk (auth silently breaks)

Never pass a custom `tokenType` in credential/request config. n8n's
`requestOAuth2` only signs with a Bearer header when tokenType is the default;
any override makes it silently fall back to query-param auth, which Zoho
rejects. Symptom: 401s that look like bad credentials while the token is
fine. This was the root cause behind PR #33's follow-up fix (commit 7c2ee8c).

All four HTTP helpers in `nodes/GenericFunctions.ts` route through
`this.helpers.requestOAuth2.call(this, 'zohoApi', options)` — keep it that
way. Do NOT reintroduce manual token refresh; the per-request refresh pattern
caused Zoho throttle storms (removed in PR #33).

## Verify call-site inventories with grep

Plan documents lie about caller counts. Before deleting or migrating any
shared function, `grep -rn "functionName" nodes/ credentials/` and reconcile
against what the plan claims. (A plan once said `getAccessTokenData` had 3
callers; it had 4 — the miss would have broken ZohoCalendar.)

## Pushing to GitHub

The SSH agent refuses `id_rsa` for this repo. Push via gh's credential helper:

```bash
git -c credential.helper='!gh auth git-credential' push https://github.com/marceldarvas/n8n-nodes-zoho.git <branch>
```

## Known-failing test on master

`ZohoBilling.test.ts` has a pre-existing organizationId failure on master.
If it fails in your branch, check whether master fails identically before
attributing it to your change:
`git stash && npm test -- ZohoBilling && git stash pop`

## Open follow-ups (don't rediscover)

- Issue #34: Bigin list operations ignore Limit; Return All not exposed in UI.
- Stale comment in `zohoApiRequest` (`nodes/GenericFunctions.ts`) mentions `form: qs` / `grant_type` from the removed manual-refresh era.
- ZohoCalendar scope missing from credential defaults in `credentials/ZohoApi.credentials.ts`.
- Deploy model is tarball/`docker cp` (see `deploy-to-dev-rig`); npm-publish is the planned endpoint once the package stabilizes.
````

- [x] **Step 2: Verify the claims that are checkable**

```bash
grep -n "requestOAuth2" nodes/GenericFunctions.ts | head -5   # expect 4 helper call sites
grep -n "grant_type\|form: qs" nodes/GenericFunctions.ts       # stale comment still present
gh issue view 34 --repo marceldarvas/n8n-nodes-zoho --json state -q .state  # expect OPEN
```

If any check contradicts the skill text, fix the skill text (not the code).

- [x] **Step 3: Commit**

```bash
git add .claude/skills/codebase-gotchas/SKILL.md
git commit -m "feat: add codebase-gotchas skill"
```

---

### Task 4: Validation of all three skills

**Files:** none created; fixes applied to the three SKILL.md files if gaps found.

- [x] **Step 1: Read-only live checks — every factual claim the skills make that can be verified without deploying:**

```bash
# Containers exist under the documented names
docker ps --format '{{.Names}}' | grep n8n-traefik-n8n-1
ssh n8n-lab 'docker ps --format "{{.Names}}" | grep n8n-stack-n8n-1'
# Smoke workflow ID still valid
ssh n8n-lab 'docker exec n8n-stack-n8n-1 n8n list:workflow' | grep ls4wQp0tx7p2Kw0Q
# Log-grep pattern executes and returns a count (0 on a healthy rig)
ssh n8n-lab 'docker logs --since 5m n8n-stack-n8n-1 2>&1 | grep -icE "error loading|failed to load"'
# Instance healthz
curl -sf https://node.overace.agency/healthz && echo OK
# Local deploy script present
test -x /Users/marcel/Developer/Hosting/Apps/n8n/n8n-traefik/install-custom-node.sh && echo OK
```

Every command must succeed with the output the skills claim. Any mismatch →
fix the skill text.

**Explicit waiver:** the destructive dev-server deploy sequence (mv-aside +
docker cp + restart) is NOT rehearsed during validation — rehearsing it is
running it. It is validated by its first real use; the rollback block exists
for that case.

- [x] **Step 2: Dispatch one fresh subagent per skill (model: sonnet), giving it ONLY the skill file path and a scenario. It must answer from the skill text alone — no repo exploration, no live commands.**

Scenarios:
- deploy-to-dev-rig: "You fixed a Bigin auth bug and need to test it against live Zoho. Which rig do you deploy to, list the exact commands, and state how you verify the deploy landed."
- live-debugging: "The Bigin node started returning 401s on the dev server after a deploy. List the exact commands you run, in order, and what each result would tell you."
- codebase-gotchas: "You're about to delete a shared helper in GenericFunctions.ts and push a PR. What must you check first, and how do you push?"

- [x] **Step 3: Review each answer against the skill (main agent)**

Pass criteria: correct rig choice / command sequence / no invented steps or
out-of-band knowledge required. Any gap → fix the skill text, re-run that one
subagent.

- [x] **Step 4: Commit any fixes**

```bash
git add .claude/skills/
git commit -m "fix: close gaps found in skill validation"
```

---

### Task 5: Push and PR

- [ ] **Step 1: Push the branch (credential-helper workaround)**

```bash
git -c credential.helper='!gh auth git-credential' push -u https://github.com/marceldarvas/n8n-nodes-zoho.git docs/dev-rig-skills
```

- [ ] **Step 2: Open the PR**

```bash
gh pr create --repo marceldarvas/n8n-nodes-zoho --base master \
  --title "feat: project skills for dev-rig deploy and debugging" \
  --body "$(cat <<'EOF'
Adds three project skills under .claude/skills/ so any capable model session can deploy, smoke-test, and debug this package on the dev rigs: deploy-to-dev-rig (both rigs, wipe-before-docker-cp baked in), live-debugging (logs, CLI-triggered smoke runs, Zoho error decoding), codebase-gotchas (tokenType quirk, push workaround, known-failing test, open follow-ups).

Design spec: docs/plans/2026-07-07-dev-rig-skills-design.md

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Report PR URL and remaining open item (n8n REST API key location placeholder) to Marcel**
