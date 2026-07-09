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
against what the plan claims. Every caller grep finds must be migrated before
the function is deleted — grep is authoritative, the plan is not. (A plan once
said `getAccessTokenData` had 3 callers; it had 4 — the miss would have broken
ZohoCalendar.)

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
