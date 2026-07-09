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
npm run build   # from the repo root
cd ~/Developer/Hosting/Apps/n8n/n8n-traefik
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
npm run build   # from the repo root
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

# 2. No loader errors after restart
sleep 20  # let n8n boot before reading logs
ssh n8n-lab 'docker logs --since 2m n8n-stack-n8n-1 2>&1 | grep -icE "error loading|failed to load"'
# Expected: 0

# 3. Instance is up — probe from inside the box; the public URL sits behind
#    a Cloudflare 302, so a plain `curl -sf` succeeds without proving anything
ssh n8n-lab 'curl -sf http://localhost:5678/healthz'
# Expected: {"status":"ok"}
```

If the version check shows the OLD version, the copy didn't land — rerun the
full deploy sequence from the build step; do not patch files in place.

For local-rig verification, replace the ssh wrapper with direct `docker`
commands against `n8n-traefik-n8n-1`.

## After deploying

Run the smoke test — see the `live-debugging` skill. Throttle/auth fixes must
pass **two consecutive runs** to count as confirmed.
