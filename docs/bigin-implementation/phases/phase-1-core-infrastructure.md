# Phase 1: Core Infrastructure Setup

> Foundation layer for Zoho Bigin API integration

## 📋 Overview

Phase 1 establishes the foundational infrastructure required for all Bigin API operations. This includes updating OAuth2 credentials, creating helper functions for API requests, and implementing multi-regional base URL support.

**Priority**: Critical
**Estimated Effort**: 2-3 hours
**Dependencies**: None
**Blocks**: All other phases

## 🎯 Objectives

1. ✅ Extend OAuth2 credentials to support Bigin scopes
2. ✅ Create `zohoBiginApiRequest()` helper function
3. ✅ Implement `getBiginBaseUrl()` for regional support
4. ✅ Ensure token refresh compatibility
5. ✅ Maintain backward compatibility with existing nodes

## 📂 Files to Modify

### 1. `credentials/ZohoApi.credentials.ts`

**Current State**: Contains scopes for CRM, Subscriptions, Sheets, Mail, Tasks, WorkDrive

**Required Changes**: Add Bigin scopes to the existing scope string

**Location**: Line 71

#### Implementation

```typescript
{
    displayName: 'Scope',
    name: 'scope',
    type: 'string',
    default: 'ZohoCRM.modules.ALL,ZohoCRM.settings.all,ZohoCRM.users.all,ZohoSubscriptions.fullaccess.ALL,ZohoSheet.dataAPI.ALL,ZohoMail.tasks.ALL,WorkDrive.files.ALL,ZohoMail.accounts.READ,ZohoMail.messages.ALL,ZohoBigin.modules.ALL,ZohoBigin.settings.ALL,ZohoBigin.users.ALL,ZohoBigin.org.read,ZohoBigin.coql.READ',
},
```

#### Bigin Scopes Explained

| Scope | Purpose |
|-------|---------|
| `ZohoBigin.modules.ALL` | Full access to all Bigin modules (Pipelines, Contacts, Accounts, etc.) |
| `ZohoBigin.settings.ALL` | Access to settings, custom fields, layouts, views |
| `ZohoBigin.users.ALL` | Access to user information and permissions |
| `ZohoBigin.org.read` | Read organization details |
| `ZohoBigin.coql.READ` | Execute COQL (Zoho Common Query Language) queries |

**Note**: Adding these scopes doesn't break existing functionality. Users with existing OAuth connections will need to re-authenticate to grant the new Bigin scopes.

---

### 2. `nodes/GenericFunctions.ts`

#### Task 2.1: Add Base URL Mapping Function

Add this function after the existing `getSubscriptionsBaseUrl()` function (around line 58):

```typescript
/**
 * Map Zoho OAuth2 token URL to the appropriate Bigin API base URL.
 * Supports all Zoho regions: US, EU, AU, IN, CN, JP, SA, CA.
 *
 * @param accessTokenUrl - The OAuth2 token URL from credentials
 * @returns The corresponding Bigin API base URL
 */
export function getBiginBaseUrl(accessTokenUrl: string): string {
    const urlMap: { [key: string]: string } = {
        'https://accounts.zoho.com/oauth/v2/token': 'https://www.zohoapis.com/bigin/v2',
        'https://accounts.zoho.eu/oauth/v2/token': 'https://www.zohoapis.eu/bigin/v2',
        'https://accounts.zoho.com.au/oauth/v2/token': 'https://www.zohoapis.com.au/bigin/v2',
        'https://accounts.zoho.in/oauth/v2/token': 'https://www.zohoapis.in/bigin/v2',
        'https://accounts.zoho.com.cn/oauth/v2/token': 'https://www.zohoapis.com.cn/bigin/v2',
        'https://accounts.zoho.jp/oauth/v2/token': 'https://www.zohoapis.jp/bigin/v2',
        'https://accounts.zoho.sa/oauth/v2/token': 'https://www.zohoapis.sa/bigin/v2',
        'https://accounts.zoho.ca/oauth/v2/token': 'https://www.zohoapis.ca/bigin/v2',
    };

    return urlMap[accessTokenUrl] || urlMap['https://accounts.zoho.com/oauth/v2/token'];
}
```

**Why This Approach?**
- Matches the pattern used in `getSubscriptionsBaseUrl()`
- Automatically selects correct regional endpoint based on OAuth configuration
- Falls back to US endpoint if region not found
- Supports all 8 Zoho data center regions

#### Task 2.2: Add Bigin API Request Function

Add this function after `zohoCalendarApiRequest()` (around line 226):

```typescript
/**
 * Make an authenticated API request to Zoho Bigin API.
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param endpoint - API endpoint path (e.g., '/Contacts', '/Pipelines/123456789')
 * @param body - Request body (for POST, PUT, PATCH)
 * @param qs - Query string parameters
 * @returns API response data
 */
export async function zohoBiginApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
) {
    const credentials = await this.getCredentials('zohoApi');
    const {access_token} = await getAccessTokenData.call(this);

    // Get the appropriate base URL for the user's region
    const baseUrl = getBiginBaseUrl(credentials.accessTokenUrl as string);

    const options: IRequestOptions = {
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            'Content-Type': 'application/json',
        },
        json: true,
    };

    if (Object.keys(qs).length) {
        options.qs = qs;
    }

    if (Object.keys(body).length) {
        options.body = body;
    }

    try {
        const responseData = await this.helpers.request!(options);

        // Check for Bigin API error responses
        throwOnErrorStatus.call(this, responseData);

        return responseData;
    } catch (error) {
        const errorData = (error as any).cause?.data;
        const args = errorData
            ? {
                message: errorData.message || 'The Zoho Bigin API returned an error.',
                description: JSON.stringify(errorData, null, 2),
            }
            : undefined;
        throw new NodeApiError(this.getNode(), error as JsonObject, args);
    }
}
```

**Function Design Decisions**:

1. **Automatic Region Detection**: Uses `getBiginBaseUrl()` to select correct regional API
2. **Standard OAuth Header**: Uses `Zoho-oauthtoken` format (same as other Zoho APIs)
3. **JSON Handling**: Sets `Content-Type: application/json` and `json: true`
4. **Error Handling**:
   - Reuses `throwOnErrorStatus()` for consistent error checking
   - Provides detailed error messages with full response data
   - Uses `NodeApiError` for proper n8n error formatting
5. **Query String Support**: Enables filtering, pagination, sorting via `qs` parameter
6. **Request Body Support**: For create/update operations

---

### 3. Export the New Functions

Update the exports at the top of `GenericFunctions.ts` if there's an export section, or ensure functions are exported by the `export` keyword.

**Verify these functions are exported**:
```typescript
export function getBiginBaseUrl(accessTokenUrl: string): string { ... }
export async function zohoBiginApiRequest(...) { ... }
```

---

## 🧪 Testing Phase 1

### Manual Verification Checklist

After implementing Phase 1, verify:

- [ ] **TypeScript compilation succeeds** (`npm run build`)
- [ ] **No TSLint errors** (`npm run tslint`)
- [ ] **OAuth credential scope includes Bigin scopes**
- [ ] **`getBiginBaseUrl()` returns correct URLs for all regions**
- [ ] **Function exports are accessible from other files**

### Unit Test Examples

Create tests in `GenericFunctions.test.ts` (if test file exists):

```typescript
import { getBiginBaseUrl } from './GenericFunctions';

describe('getBiginBaseUrl', () => {
    it('should return US base URL for US token endpoint', () => {
        const url = getBiginBaseUrl('https://accounts.zoho.com/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.com/bigin/v2');
    });

    it('should return EU base URL for EU token endpoint', () => {
        const url = getBiginBaseUrl('https://accounts.zoho.eu/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.eu/bigin/v2');
    });

    it('should return AU base URL for AU token endpoint', () => {
        const url = getBiginBaseUrl('https://accounts.zoho.com.au/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.com.au/bigin/v2');
    });

    it('should return IN base URL for IN token endpoint', () => {
        const url = getBiginBaseUrl('https://accounts.zoho.in/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.in/bigin/v2');
    });

    it('should return CN base URL for CN token endpoint', () => {
        const url = getBiginBaseUrl('https://accounts.zoho.com.cn/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.com.cn/bigin/v2');
    });

    it('should fallback to US for unknown token endpoint', () => {
        const url = getBiginBaseUrl('https://unknown.zoho.com/oauth/v2/token');
        expect(url).toBe('https://www.zohoapis.com/bigin/v2');
    });
});
```

### Integration Test

Once the node is partially implemented, test with a simple API call:

```typescript
// In ZohoBigin.node.ts (temporary test)
const responseData = await zohoBiginApiRequest.call(
    this,
    'GET',
    '/settings/modules',
    {},
    {}
);
console.log('Bigin Modules:', responseData);
```

This should return a list of available modules in your Bigin account.

---

## 📋 Acceptance Criteria

Phase 1 is complete when:

1. ✅ **Credential file updated** with all Bigin OAuth scopes
2. ✅ **`getBiginBaseUrl()` implemented** and handles all 8 regions
3. ✅ **`zohoBiginApiRequest()` implemented** with proper error handling
4. ✅ **Code compiles** without TypeScript errors
5. ✅ **Code passes** TSLint checks
6. ✅ **Functions are exported** and accessible to other modules
7. ✅ **Token refresh** works correctly (reuses existing `getAccessTokenData()`)

---

## 🔄 Integration Points

### Used By (Dependencies)

- ✅ Phase 2: Node Descriptions (will reference these functions)
- ✅ Phase 3: Main Node Implementation (will call `zohoBiginApiRequest()`)
- ✅ All module implementations (Pipelines, Contacts, etc.)

### Uses (Dependencies)

- ✅ Existing `getAccessTokenData()` function
- ✅ Existing `throwOnErrorStatus()` function
- ✅ ZohoApi credentials configuration
- ✅ n8n-workflow helper functions

---

## 🚨 Common Pitfalls

### 1. Forgetting to Export Functions

**Problem**: Functions work in the same file but can't be imported elsewhere

**Solution**: Ensure functions have `export` keyword:
```typescript
export function getBiginBaseUrl(...) { ... }
export async function zohoBiginApiRequest(...) { ... }
```

### 2. Incorrect Base URL Format

**Problem**: Missing `/v2` or trailing slashes cause API errors

**Solution**:
- ✅ Correct: `https://www.zohoapis.com/bigin/v2`
- ❌ Wrong: `https://www.zohoapis.com/bigin/v2/` (trailing slash)
- ❌ Wrong: `https://www.zohoapis.com/bigin` (missing version)

### 3. OAuth Scope Order

**Problem**: Scope string becomes unmanageable

**Solution**: Keep scopes organized logically:
```typescript
// Group by product
'ZohoCRM.modules.ALL,ZohoCRM.settings.all,ZohoCRM.users.all,' +  // CRM scopes
'ZohoBigin.modules.ALL,ZohoBigin.settings.ALL,ZohoBigin.users.ALL,' +  // Bigin scopes
'ZohoSubscriptions.fullaccess.ALL,' +  // Subscriptions scopes
'...'
```

### 4. Error Handling

**Problem**: API errors not properly caught or displayed

**Solution**: Always wrap API calls in try-catch and use `NodeApiError`:
```typescript
try {
    const responseData = await this.helpers.request!(options);
    return responseData;
} catch (error) {
    throw new NodeApiError(this.getNode(), error as JsonObject, {
        message: 'Bigin API error',
        description: JSON.stringify(error, null, 2),
    });
}
```

---

## 💡 Best Practices

1. **Consistent Naming**: Use `Bigin` (not `bigin` or `BIGIN`) in function names
2. **Comment Headers**: Add JSDoc comments explaining function purpose and parameters
3. **Type Safety**: Always type function parameters and return values
4. **Error Messages**: Provide clear, actionable error messages for users
5. **Regional Support**: Never hardcode regional URLs - always use mapping function
6. **Backward Compatibility**: Don't modify existing function signatures

---

## 📝 Notes

### Regional Endpoint Behavior

- Bigin API requires requests to the correct regional endpoint
- The `api_domain` returned during OAuth is region-specific
- Using wrong region results in 401 or 404 errors
- The mapping function ensures automatic correct routing

### OAuth Token Refresh

- Bigin uses the same OAuth flow as other Zoho products
- Existing `getAccessTokenData()` handles token refresh automatically
- No Bigin-specific token handling needed
- Access tokens expire after 1 hour and refresh automatically

### Future Considerations

- **Webhook Support**: Bigin may support webhooks - investigate in Phase 6
- **Rate Limiting**: Zoho APIs have rate limits - may need to add retry logic
- **Bulk Operations**: Bigin has bulk APIs - consider in Phase 6
- **COQL Support**: Advanced queries using Zoho Common Query Language

---

## ✅ Completion Checklist

Before moving to Phase 2:

- [ ] All code changes committed to git
- [ ] Code compiles without errors (`npm run build`)
- [ ] TSLint passes (`npm run tslint`)
- [ ] Manual testing of `getBiginBaseUrl()` with different regions
- [ ] Functions properly exported and importable
- [ ] Documentation updated (this file)
- [ ] Ready to proceed to Phase 2

---

**Next Phase**: [Phase 2: Node Descriptions](./phase-2-node-descriptions.md)

**Related Modules**: This phase enables all modules

**Status**: 📝 Documentation Complete - Ready for Implementation
