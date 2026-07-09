# OAuth2 Token-Refresh Storm Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop the package from refreshing the Zoho OAuth token on every API call, which triggers Zoho's accounts-server throttle ("Access Denied / too many requests continuously") after a handful of requests.

**Architecture:** Delete the hand-rolled `getAccessTokenData` refresh (its `if (expires_in > 0)` guard is always true — `expires_in` is the static 3600s lifetime, not a countdown — so EVERY request POSTs to `accounts.zoho.*/oauth/v2/token` first, and the refreshed token is never persisted). Replace all its call sites with n8n's built-in `this.helpers.requestOAuth2.call(this, 'zohoApi', options, { tokenType: 'Zoho-oauthtoken' })`, which injects the Authorization header itself, refreshes only when the API returns 401, and persists rotated tokens back to the credential. This is the same pattern n8n's stock Zoho nodes use.

**Tech Stack:** TypeScript, n8n-workflow ^2.16.0, Jest (`npm test`), build via `npm run build` (`tsc && gulp`).

**Repo / branch:** work in `<repo root>` (its own git repo, remote `marceldarvas/n8n-nodes-zoho`). Create branch `fix/oauth2-refresh-storm` off `master`. NOTE: `npm install` on this machine needs `--ignore-scripts` (Node 26 can't build the optional `isolated-vm` native dep; it's unused at dev time).

---

## Context for a zero-context engineer

- The package ships 6 n8n nodes (Bigin/Billing/Calendar/Email/Sheets/Tasks) + 1 OAuth2 credential (`zohoApi`, extends n8n's `oAuth2Api`). All HTTP goes through helpers in `nodes/GenericFunctions.ts`.
- `getAccessTokenData` (nodes/GenericFunctions.ts:122) is the bug. It has exactly three callers:
  - `zohoApiRequest` (≈line 175) — used by Mail/Sheets/Tasks/Calendar nodes
  - `zohoSubscriptionsApiRequest` (≈line 230) — used by Billing node (and via `zohoSubscriptionsApiRequestAllItems`, which delegates to it — no change needed there)
  - `zohoBiginApiRequest` (≈line 535) — used by the Bigin node; it builds an `Authorization` header and passes options to `executeWithRetry` (≈line 414), which does the actual `context.helpers.request!(options)` with retry/backoff.
- `this.helpers.requestOAuth2` exists on all three context types used here (`IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions`). Call shape: `this.helpers.requestOAuth2.call(this, credentialTypeName, requestOptions, oAuth2Options?)`. We pass `{ tokenType: 'Zoho-oauthtoken' }` to keep the exact header prefix the code uses today (n8n's stock Zoho nodes omit it and rely on Bearer, which Zoho also accepts — we keep parity with current behavior instead).
- Existing tests in `nodes/__tests__/GenericFunctions.test.ts` mock `helpers.request` and set `expires_in: 0, // Set to 0 to skip token refresh in tests` — i.e. they deliberately bypass the broken path. The refactor rewrites those describe blocks to the new contract.
- Coding style: tabs in tests, 4-space in GenericFunctions.ts — match each file's existing style. Do NOT delete existing comments. Do NOT fix unrelated oddities you notice (e.g. `zohoApiRequest`'s `form: qs` quirk and its commented-out body block stay as-is; note oddities in the PR description instead).

## File Structure

- Modify: `nodes/GenericFunctions.ts` — delete `getAccessTokenData`, refactor 3 request helpers + `executeWithRetry`.
- Modify: `nodes/__tests__/GenericFunctions.test.ts` — rewrite `zohoApiRequest` + `zohoSubscriptionsApiRequest` describe blocks; add new `zohoBiginApiRequest` block.
- Modify: `package.json` — version `1.0.2` → `1.0.3`.
- No other files change. All 6 nodes are fixed transitively through the helpers.

---

### Task 1: Branch + red tests for `zohoApiRequest`

**Files:**
- Modify: `nodes/__tests__/GenericFunctions.test.ts` (the `describe('zohoApiRequest', ...)` block, currently ≈lines 81–175)

- [ ] **Step 1: Create the branch**

```bash
cd <repo root>
git checkout master && git pull --ff-only
git checkout -b fix/oauth2-refresh-storm
npm install --ignore-scripts
```

- [ ] **Step 2: Rewrite the `zohoApiRequest` describe block to the new contract**

Replace the whole existing `describe('zohoApiRequest', ...)` block with (tabs, matching file style):

```ts
	describe('zohoApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn(); // must never be called: raw request = token-storm regression
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should delegate auth to requestOAuth2 with the zohoApi credential', async () => {
			const mockResponse = { data: [{ status: 'success', id: '123' }] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com',
				'/api/v2/users',
				{},
				{ page: 1 },
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options).toEqual(
				expect.objectContaining({
					method: 'GET',
					baseURL: 'https://www.zohoapis.com',
					uri: '/api/v2/users',
					form: { page: 1 },
				}),
			);
			expect(options.headers?.Authorization).toBeUndefined();
			expect(oAuth2Options).toEqual({ tokenType: 'Zoho-oauthtoken' });
		});

		it('should never call the raw request helper (token-refresh storm regression)', async () => {
			mockRequestOAuth2.mockResolvedValue({ data: [] });

			await zohoApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com',
				'/api/v2/users',
			);

			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should throw error when request fails', async () => {
			mockRequestOAuth2.mockRejectedValue(new Error('Network error'));

			await expect(
				zohoApiRequest.call(
					mockContext,
					'GET',
					'https://www.zohoapis.com',
					'/api/v2/users',
				),
			).rejects.toThrow();
		});

		it('should throw error when response contains error status', async () => {
			mockRequestOAuth2.mockResolvedValue({
				data: [{ status: 'error', message: 'Invalid request' }],
			});

			await expect(
				zohoApiRequest.call(
					mockContext,
					'POST',
					'https://www.zohoapis.com',
					'/api/v2/users',
				),
			).rejects.toThrow();
		});
	});
```

- [ ] **Step 3: Run to verify the new tests fail**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoApiRequest'`
Expected: FAIL — current implementation calls `helpers.request` and `getAccessTokenData` throws `'Missing Zoho OAuth2 token data in credentials.'` (the mock credential has no `oauthTokenData`).

### Task 2: Green — refactor `zohoApiRequest`

**Files:**
- Modify: `nodes/GenericFunctions.ts` (function `zohoApiRequest`, ≈line 167)

- [ ] **Step 1: Refactor the function**

Replace the body's first line and the request call. Before:

```ts
    const {access_token} = await getAccessTokenData.call(this);
    const options: IRequestOptions = {
        method,
        baseURL,
        uri,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
        },
        // json: false,
        form: qs  // grant_type: 'refresh_token',
    };
```

After (keep the surrounding commented-out block below it untouched):

```ts
    const options: IRequestOptions = {
        method,
        baseURL,
        uri,
        // json: false,
        form: qs  // grant_type: 'refresh_token',
    };
```

And in the `try` block, before:

```ts
        const responseData = await this.helpers.request!(options);
```

After:

```ts
        const responseData = await this.helpers.requestOAuth2.call(this, 'zohoApi', options, {
            tokenType: 'Zoho-oauthtoken',
        });
```

- [ ] **Step 2: Run the block's tests**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoApiRequest'`
Expected: PASS (4 tests)

- [ ] **Step 3: Commit**

```bash
git add nodes/GenericFunctions.ts nodes/__tests__/GenericFunctions.test.ts
git commit -m 'fix: route zohoApiRequest through requestOAuth2 to stop per-call token refresh'
```

### Task 3: `zohoSubscriptionsApiRequest` — red then green

**Files:**
- Modify: `nodes/__tests__/GenericFunctions.test.ts` (the `describe('zohoSubscriptionsApiRequest', ...)` block, currently ≈lines 176–339)
- Modify: `nodes/GenericFunctions.ts` (function `zohoSubscriptionsApiRequest`, ≈line 224)

- [ ] **Step 1: Rewrite the describe block to the new contract**

Replace the whole existing `describe('zohoSubscriptionsApiRequest', ...)` block with:

```ts
	describe('zohoSubscriptionsApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should delegate auth to requestOAuth2 and keep the organization header', async () => {
			const mockResponse = { code: 0, subscriptions: [] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com/billing/v1/subscriptions',
				{},
				{ page: 1 },
				'700000123',
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options).toEqual(
				expect.objectContaining({
					method: 'GET',
					uri: 'https://www.zohoapis.com/billing/v1/subscriptions',
					qs: { page: 1 },
					json: true,
				}),
			);
			expect(options.headers).toEqual({
				'X-com-zoho-subscriptions-organizationid': '700000123',
			});
			expect(oAuth2Options).toEqual({ tokenType: 'Zoho-oauthtoken' });
			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should include request body when provided', async () => {
			mockRequestOAuth2.mockResolvedValue({ code: 0 });

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'POST',
				'https://www.zohoapis.com/billing/v1/subscriptions',
				{ plan: { plan_code: 'basic' } },
				{},
				'700000123',
			);

			const [, options] = mockRequestOAuth2.mock.calls[0];
			expect(options.body).toEqual({ plan: { plan_code: 'basic' } });
		});

		it('should not include qs when query string is empty', async () => {
			mockRequestOAuth2.mockResolvedValue({ code: 0 });

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com/billing/v1/plans',
				{},
				{},
				'700000123',
			);

			const [, options] = mockRequestOAuth2.mock.calls[0];
			expect(options.qs).toBeUndefined();
		});

		it('should throw error when request fails', async () => {
			mockRequestOAuth2.mockRejectedValue(new Error('boom'));

			await expect(
				zohoSubscriptionsApiRequest.call(
					mockContext,
					'GET',
					'https://www.zohoapis.com/billing/v1/plans',
					{},
					{},
					'700000123',
				),
			).rejects.toThrow();
		});
	});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoSubscriptionsApiRequest'`
Expected: FAIL (implementation still calls `getAccessTokenData` / `helpers.request`).

- [ ] **Step 3: Refactor the function**

In `zohoSubscriptionsApiRequest`, delete the line:

```ts
    const {access_token} = await getAccessTokenData.call(this);
```

Change the headers block from:

```ts
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            'X-com-zoho-subscriptions-organizationid': organizationId,
        },
```

to:

```ts
        headers: {
            'X-com-zoho-subscriptions-organizationid': organizationId,
        },
```

And change the request call from:

```ts
        const responseData = await this.helpers.request!(options);
```

to:

```ts
        const responseData = await this.helpers.requestOAuth2.call(this, 'zohoApi', options, {
            tokenType: 'Zoho-oauthtoken',
        });
```

- [ ] **Step 4: Run the block's tests**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoSubscriptionsApiRequest'`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add nodes/GenericFunctions.ts nodes/__tests__/GenericFunctions.test.ts
git commit -m 'fix: route zohoSubscriptionsApiRequest through requestOAuth2'
```

### Task 4: `zohoBiginApiRequest` + `executeWithRetry` — red then green

**Files:**
- Modify: `nodes/__tests__/GenericFunctions.test.ts` (add a new `describe('zohoBiginApiRequest', ...)` block after the `zohoSubscriptionsApiRequest` block; also add `zohoBiginApiRequest` to the import list at the top of the file)
- Modify: `nodes/GenericFunctions.ts` (`executeWithRetry` ≈line 414, `zohoBiginApiRequest` ≈line 526)

- [ ] **Step 1: Add the new describe block (and import)**

Add `zohoBiginApiRequest` to the existing import from `'../GenericFunctions'`. Then add:

```ts
	describe('zohoBiginApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zohoBigin',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.eu/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should call requestOAuth2 with the region-mapped Bigin base URL', async () => {
			const mockResponse = { data: [{ status: 'success', id: '1' }] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts');

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options.url).toBe('https://www.zohoapis.eu/bigin/v1/Contacts');
			expect(options.headers?.Authorization).toBeUndefined();
			expect(options.headers?.['Content-Type']).toBe('application/json');
			expect(oAuth2Options).toEqual({ tokenType: 'Zoho-oauthtoken' });
			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should retry on 429 and succeed on the second attempt', async () => {
			const rateLimitError = Object.assign(new Error('rate limited'), {
				statusCode: 429,
				response: { headers: { 'retry-after': '0' } },
			});
			mockRequestOAuth2
				.mockRejectedValueOnce(rateLimitError)
				.mockResolvedValueOnce({ data: [{ status: 'success' }] });

			const result = await zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts');

			expect(mockRequestOAuth2).toHaveBeenCalledTimes(2);
			expect(result).toEqual({ data: [{ status: 'success' }] });
		});

		it('should not retry on non-429 client errors', async () => {
			const badRequest = Object.assign(new Error('bad request'), { statusCode: 400 });
			mockRequestOAuth2.mockRejectedValue(badRequest);

			await expect(
				zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts'),
			).rejects.toThrow();
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
		});
	});
```

- [ ] **Step 2: Run to verify failure**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoBiginApiRequest'`
Expected: FAIL (`getAccessTokenData` throws on missing `oauthTokenData`).

- [ ] **Step 3: Refactor `executeWithRetry` to authenticate via requestOAuth2**

In `executeWithRetry`, change only the request line. Before:

```ts
            const responseData = await context.helpers.request!(options);
```

After:

```ts
            const responseData = await context.helpers.requestOAuth2.call(context, 'zohoApi', options, {
                tokenType: 'Zoho-oauthtoken',
            });
```

Everything else in `executeWithRetry` (backoff, metrics, retry classification) stays untouched.

- [ ] **Step 4: Refactor `zohoBiginApiRequest`**

Delete the line:

```ts
    const {access_token} = await getAccessTokenData.call(this);
```

Change the options headers from:

```ts
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            ...(headers || {}),
        },
```

to:

```ts
        headers: {
            ...(headers || {}),
        },
```

The rest of the function (formData handling, Content-Type logic, `executeWithRetry` call, `throwOnErrorStatus`) stays untouched.

- [ ] **Step 5: Run the block's tests**

Run: `npx jest nodes/__tests__/GenericFunctions.test.ts -t 'zohoBiginApiRequest'`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add nodes/GenericFunctions.ts nodes/__tests__/GenericFunctions.test.ts
git commit -m 'fix: route Bigin requests through requestOAuth2 in executeWithRetry'
```

### Task 5: Delete `getAccessTokenData`, full suite + build

**Files:**
- Modify: `nodes/GenericFunctions.ts` (delete function `getAccessTokenData` ≈lines 122–155)
- Modify: `package.json` (version bump)

- [ ] **Step 1: Delete the function and dead references**

Delete the whole `getAccessTokenData` function (including its doc comment). Then check for leftovers:

```bash
grep -rn "getAccessTokenData" nodes/ credentials/
```

Expected: no matches. If the `ZohoOAuth2ApiCredentials` type import at the top of GenericFunctions.ts is now unused, remove that import too (verify with the build in Step 3 — TS6133/6196 noise or eslint will tell you; if the type is still used elsewhere, leave it).

- [ ] **Step 2: Run the full test suite**

Run: `npx jest`
Expected: ALL tests pass. (`ZohoBilling.test.ts` only asserts node-description structure — verified: it never mocks the request helpers — so it is unaffected by this refactor.)

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: clean `tsc && gulp` output, `dist/nodes/*.node.js` present for all 6 nodes.

- [ ] **Step 4: Bump version and commit**

In `package.json` change `"version": "1.0.2"` to `"version": "1.0.3"`.

```bash
git add nodes/GenericFunctions.ts package.json
git commit -m 'fix: remove per-request token refresh (getAccessTokenData)'
```

### Task 6: Live verification on the local rig

The local dev n8n (2.28.7) lives at `~/Developer/Hosting/Apps/n8n/n8n-traefik`. The install script builds the package and copies it into the running container.

- [ ] **Step 1: Deploy the fixed build locally**

```bash
cd ~/Developer/Hosting/Apps/n8n/n8n-traefik
docker compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d n8n
./install-custom-node.sh
```

Expected: script's own checks pass ("Compiled files found", container restarts, healthz ok).

- [ ] **Step 2: Verify no loader errors**

```bash
docker logs --since 2m n8n-traefik-n8n-1 2>&1 | grep -icE 'error loading|failed to load'
```

Expected: `0`

- [ ] **Step 3: Ask Marcel to run the smoke workflow**

This step needs a human (OAuth credential lives in his n8n). Ask Marcel to run the existing test workflow (Manual Trigger → Bigin: Get Organization → Bigin: List Contacts) on the instance where the `zohoApi` credential is connected, twice in a row. Acceptance: both runs green, NO "Access Denied / too many requests continuously" error. Before the fix, the second run reliably tripped Zoho's accounts throttle.

NOTE: if the credential is connected on the dev server (node.overace.agency) rather than locally, deploy there instead: build, then copy `dist` + `package.json` to the box and restart —

```bash
npm run build   # from the repo root
tar -czf /tmp/zoho-node.tgz dist package.json index.js
scp /tmp/zoho-node.tgz n8n-lab:~/n8n-stack/
ssh n8n-lab 'cd ~/n8n-stack && tar -xzf zoho-node.tgz && docker cp dist n8n-stack-n8n-1:/home/node/.n8n/custom/n8n-nodes-zoho/dist && docker cp package.json n8n-stack-n8n-1:/home/node/.n8n/custom/n8n-nodes-zoho/package.json && docker exec -u root n8n-stack-n8n-1 chown -R node:node /home/node/.n8n/custom && docker restart n8n-stack-n8n-1'
```

### Task 7: PR

- [ ] **Step 1: Push and open the PR**

```bash
git push -u origin fix/oauth2-refresh-storm
gh pr create --title 'fix: stop OAuth token refresh on every API call' --body 'Replaces the hand-rolled getAccessTokenData (refreshed the token on EVERY request because expires_in is a static lifetime, tripping Zoho accounts throttle) with n8n requestOAuth2, which refreshes on 401 only and persists rotated tokens. Fixes the "Access Denied / too many requests continuously" error seen after ~5 calls. Known oddity left untouched on purpose: zohoApiRequest still sends query params via `form:` — pre-existing behavior, separate issue.'
```

Do NOT merge — Marcel merges after reviewing. Direct pushes to `master` are blocked in this environment; the PR flow is required.

---

## Verification summary

- Unit: `npx jest` all green; regression tests assert `helpers.request` is never called by the three request helpers.
- Build: `npm run build` clean.
- Live: smoke workflow twice in a row without the accounts-throttle error (Task 6 Step 3 — needs Marcel).

## Out of scope

- `zohoApiRequest`'s `form: qs` quirk and commented-out body-handling block (pre-existing; note in PR only).
- Adding the missing ZohoCalendar scope to the credential's default scope string (separate known issue).
- tslint→eslint modernization.
