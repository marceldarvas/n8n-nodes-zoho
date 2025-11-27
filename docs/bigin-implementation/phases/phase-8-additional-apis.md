# Phase 8: Additional APIs & Production Enhancements

> Implement remaining API operations and production-ready features discovered during documentation review

## 📋 Overview

Phase 8 covers additional Bigin API operations discovered during comprehensive documentation review and production-readiness enhancements. These features round out the integration and prepare it for enterprise use.

**Priority**: Medium (valuable for advanced workflows)
**Estimated Effort**: 8-11 hours
**Dependencies**: Phase 7 complete
**Blocks**: None

**Note**: COQL Support was already implemented in branch `claude/add-coql-support-01JG4dhKCAefmuXiuUYCYZMr` ✅

## 🎯 Objectives

1. 🔄 **Upsert Operations** - Insert or update records in one call
2. 🗑️ **Deleted Records API** - Retrieve and manage deleted records
3. 📊 **Modules & Settings APIs** - Dynamic module and field discovery
4. 🔔 **Webhooks Integration** - Real-time notifications (optional)
5. ⚡ **Performance & Production** - Rate limiting, caching, error recovery

---

## Feature 1: Upsert Operations

### Overview

Upsert (Update or Insert) allows you to create a record if it doesn't exist, or update it if it does, based on a unique field. This simplifies workflows and reduces API calls.

### API Endpoint

```
POST /bigin/v2/{module_api_name}/upsert
```

### Key Benefits

- **Idempotent operations**: Safe to retry without duplicates
- **Simplified logic**: No need to check if record exists first
- **Fewer API calls**: One call instead of search + create/update

### Request Body Example

```json
{
  "data": [
    {
      "Email": "john.doe@example.com",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Phone": "+1-555-0123"
    }
  ],
  "duplicate_check_fields": ["Email"],
  "apply_feature_execution": [
    {
      "name": "layout_rules"
    }
  ]
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| data | array | Yes | Array of records to upsert |
| duplicate_check_fields | array | Yes | Fields to check for duplicates |
| apply_feature_execution | array | No | Features to apply (layout_rules, approval_rules, etc.) |

### Supported Modules

- Contacts
- Accounts
- Pipelines
- Products
- Tasks
- Events

### n8n Implementation

```typescript
{
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    options: [
        // ... existing operations
        { name: 'Upsert', value: 'upsert', description: 'Create or update a record' },
    ],
},
{
    displayName: 'Duplicate Check Fields',
    name: 'duplicateCheckFields',
    type: 'multiOptions',
    displayOptions: {
        show: {
            resource: ['contact', 'account', 'pipeline', 'product'],
            operation: ['upsert'],
        },
    },
    options: [
        { name: 'Email', value: 'Email' },
        { name: 'Phone', value: 'Phone' },
        { name: 'Name', value: 'Name' },
        { name: 'Product Code', value: 'Product_Code' },
    ],
    default: [],
    required: true,
    description: 'Fields to use for duplicate detection',
},
```

### Handler Implementation

```typescript
} else if (operation === 'upsert') {
    const duplicateCheckFields = this.getNodeParameter('duplicateCheckFields', itemIndex) as string[];
    const jsonData = this.getNodeParameter('jsonData', itemIndex) as string;

    let recordData: IDataObject;
    try {
        recordData = JSON.parse(jsonData);
    } catch (error) {
        throw new NodeOperationError(this.getNode(), 'Invalid JSON data');
    }

    const body = {
        data: [recordData],
        duplicate_check_fields: duplicateCheckFields,
    };

    const response = await zohoBiginApiRequest.call(
        this,
        'POST',
        '/Contacts/upsert',
        body,
        {},
    );

    return response.data?.[0]?.details || {};
}
```

### Use Cases

1. **Data Synchronization**: Sync contacts from external system without duplicates
2. **Import Operations**: Bulk import with automatic deduplication
3. **Integration Updates**: Update records from webhooks without checking existence

---

## Feature 2: Deleted Records API

### Overview

Retrieve records that have been deleted from Bigin, useful for audit trails, data recovery, and synchronization.

### API Endpoint

```
GET /bigin/v2/{module_api_name}/deleted
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | Type of deletion: `all`, `recycle`, `permanent` |
| page | number | Page number (default: 1) |
| per_page | number | Records per page (max: 200) |

### Response Example

```json
{
    "data": [
        {
            "deleted_by": {
                "name": "John Sales",
                "id": "4150868000000225001"
            },
            "id": "4150868000000624001",
            "display_name": "Jane Doe",
            "type": "Contacts",
            "deleted_time": "2025-01-20T10:30:00+00:00"
        }
    ],
    "info": {
        "per_page": 200,
        "count": 1,
        "page": 1,
        "more_records": false
    }
}
```

### Operations to Implement

1. **List Deleted Records**
   - Operation: `getDeletedRecords`
   - Returns: List of deleted records with metadata
   - Supports: Pagination, type filtering

### n8n Implementation

```typescript
{
    displayName: 'Deletion Type',
    name: 'deletionType',
    type: 'options',
    displayOptions: {
        show: {
            resource: ['contact', 'account', 'pipeline'],
            operation: ['getDeletedRecords'],
        },
    },
    options: [
        { name: 'All', value: 'all', description: 'All deleted records' },
        { name: 'Recycle Bin', value: 'recycle', description: 'Records in recycle bin' },
        { name: 'Permanent', value: 'permanent', description: 'Permanently deleted' },
    ],
    default: 'all',
    description: 'Type of deleted records to retrieve',
},
```

### Use Cases

1. **Audit Trail**: Track what was deleted and when
2. **Data Recovery**: Identify records for restoration
3. **Sync Operations**: Keep external systems in sync with deletions
4. **Compliance**: Meet data retention requirements

---

## Feature 3: Modules & Settings APIs

### Overview

Dynamically discover available modules, fields, and settings in the user's Bigin account.

### API Endpoints

```
GET /bigin/v2/settings/modules
GET /bigin/v2/settings/modules/{module_api_name}
GET /bigin/v2/settings/fields?module={module_api_name}
GET /bigin/v2/org
```

### Operations to Implement

#### 1. Get All Modules

**Operation**: `getModules`
**Returns**: List of all modules with metadata

```json
{
    "modules": [
        {
            "global_search_supported": true,
            "api_name": "Contacts",
            "plural_label": "Contacts",
            "singular_label": "Contact",
            "module_name": "Contacts",
            "business_card_field_limit": 5,
            "editable": true,
            "deletable": true,
            "creatable": true,
            "view_type": "1"
        }
    ]
}
```

#### 2. Get Module Metadata

**Operation**: `getModuleMetadata`
**Returns**: Detailed module configuration

#### 3. Get Fields for Module

**Operation**: `getFields`
**Returns**: All fields with types, validations, picklist values

```json
{
    "fields": [
        {
            "api_name": "Email",
            "field_label": "Email",
            "data_type": "email",
            "length": 100,
            "read_only": false,
            "required": false,
            "custom_field": false,
            "unique": {
                "casesensitive": false
            }
        }
    ]
}
```

#### 4. Get Organization Info

**Operation**: `getOrganization`
**Returns**: Organization details (timezone, currency, etc.)

### n8n Dynamic Load Options

```typescript
async getContacts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const response = await zohoBiginApiRequest.call(
        this,
        'GET',
        '/Contacts',
        {},
        { per_page: 200 },
    );

    return response.data.map((contact: any) => ({
        name: `${contact.First_Name} ${contact.Last_Name}`,
        value: contact.id,
    }));
},

async getModuleFields(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    const module = this.getNodeParameter('resource') as string;
    const response = await zohoBiginApiRequest.call(
        this,
        'GET',
        '/settings/fields',
        {},
        { module },
    );

    return response.fields.map((field: any) => ({
        name: field.field_label,
        value: field.api_name,
    }));
},
```

### Use Cases

1. **Dynamic Forms**: Build UI based on available fields
2. **Validation**: Check field types before submission
3. **Discovery**: Help users explore available modules
4. **Custom Field Support**: Automatically handle custom fields

---

## Feature 4: Webhooks & Notifications (Optional)

### Overview

Receive real-time notifications when records are created, updated, or deleted in Bigin.

### Webhook Configuration

1. **Create webhook** in Bigin settings
2. **Subscribe to events** (create, update, delete)
3. **Receive notifications** at configured URL

### n8n Trigger Node

Create `ZohoBiginTrigger.node.ts`:

```typescript
export class ZohoBiginTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Bigin Trigger',
        name: 'zohoBiginTrigger',
        icon: 'file:zoho.svg',
        group: ['trigger'],
        version: 1,
        description: 'Starts workflow on Bigin events',
        defaults: { name: 'Bigin Trigger' },
        inputs: [],
        outputs: [NodeConnectionType.Main],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'webhook',
            },
        ],
        credentials: [{ name: 'zohoApi', required: true }],
        properties: [
            {
                displayName: 'Module',
                name: 'module',
                type: 'options',
                options: [
                    { name: 'Contacts', value: 'Contacts' },
                    { name: 'Pipelines', value: 'Pipelines' },
                    { name: 'Accounts', value: 'Accounts' },
                ],
                default: 'Contacts',
            },
            {
                displayName: 'Events',
                name: 'events',
                type: 'multipleValueSlim',
                options: [
                    { name: 'Create', value: 'create' },
                    { name: 'Update', value: 'edit' },
                    { name: 'Delete', value: 'delete' },
                ],
                default: ['create', 'edit'],
            },
        ],
    };

    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const bodyData = this.getBodyData();
        return {
            workflowData: [this.helpers.returnJsonArray(bodyData)],
        };
    }
}
```

### Use Cases

1. **Real-time Sync**: Update external systems immediately
2. **Notifications**: Alert team on new deals/contacts
3. **Automation**: Trigger workflows on record changes
4. **Audit**: Log all changes in real-time

---

## Feature 5: Performance & Production Enhancements

### 1. Enhanced Rate Limit Handling

```typescript
async function handleRateLimitedRequest(
    context: IExecuteFunctions,
    options: IRequestOptions,
    retries = 3,
): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await context.helpers.request(options);
            return response;
        } catch (error: any) {
            if (error.statusCode === 429) {
                const retryAfter = error.response?.headers['retry-after'] || (i + 1) * 2;
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            throw error;
        }
    }
    throw new NodeOperationError(context.getNode(), 'Rate limit exceeded');
}
```

### 2. Response Caching

```typescript
interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

const cache = new Map<string, CacheEntry>();

function getCachedData(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
        cache.delete(key);
        return null;
    }

    return entry.data;
}

function setCachedData(key: string, data: any, ttl = 3600000): void {
    cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
    });
}
```

### 3. Batch Operation Optimization

```typescript
async function batchOperation(
    context: IExecuteFunctions,
    operation: string,
    records: IDataObject[],
    batchSize = 100,
): Promise<IDataObject[]> {
    const results: IDataObject[] = [];

    for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);

        const response = await zohoBiginApiRequest.call(
            context,
            'POST',
            `/${operation}`,
            { data: batch },
            {},
        );

        results.push(...(response.data || []));

        // Rate limiting between batches
        if (i + batchSize < records.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}
```

### 4. Error Recovery

```typescript
async function executeWithRetry(
    context: IExecuteFunctions,
    operation: () => Promise<any>,
    maxRetries = 3,
    backoff = 1000,
): Promise<any> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;

            // Don't retry on client errors (4xx)
            if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
                throw error;
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
        }
    }

    throw lastError!;
}
```

### 5. Monitoring & Logging

```typescript
interface OperationMetrics {
    operation: string;
    duration: number;
    success: boolean;
    recordCount: number;
    timestamp: Date;
}

function logMetrics(metrics: OperationMetrics): void {
    console.log(JSON.stringify({
        level: 'info',
        message: 'Bigin API operation',
        ...metrics,
    }));
}

async function trackOperation(
    context: IExecuteFunctions,
    operation: string,
    fn: () => Promise<any>,
): Promise<any> {
    const startTime = Date.now();
    let success = true;
    let recordCount = 0;

    try {
        const result = await fn();
        recordCount = Array.isArray(result) ? result.length : 1;
        return result;
    } catch (error) {
        success = false;
        throw error;
    } finally {
        logMetrics({
            operation,
            duration: Date.now() - startTime,
            success,
            recordCount,
            timestamp: new Date(),
        });
    }
}
```

---

## 📋 Implementation Priority

Recommended order based on value and effort:

1. **Upsert Operations** (High value, low effort) - 2-3 hours
2. **Deleted Records API** (Medium value, low effort) - 1-2 hours
3. **Modules & Settings APIs** (High value, medium effort) - 3-4 hours
4. **Performance Enhancements** (High value, medium effort) - 2-3 hours
5. **Webhooks** (Low value, high effort) - 4-6 hours (optional)

**Note**: COQL Support was already implemented separately ✅

---

## 📚 Learning Resources

### Upsert & Deleted Records
- [Upsert Records API](https://www.bigin.com/developer/docs/apis/v2/upsert-records.html)
- [List Deleted Records API](https://www.bigin.com/developer/docs/apis/v2/get-deleted-records.html)

### Modules & Settings
- [Get Modules API](https://www.bigin.com/developer/docs/apis/v2/modules-api.html)
- [Field Meta Data API](https://www.bigin.com/developer/docs/apis/v2/field-meta.html)
- [Get Organization API](https://www.bigin.com/developer/docs/apis/v2/get-org-data.html)

### Webhooks
- [Notifications Overview](https://www.bigin.com/developer/docs/apis/v2/notifications.html)
- [Webhook Configuration](https://www.bigin.com/developer/docs/apis/v2/webhook-config.html)

### n8n Development
- [Creating Trigger Nodes](https://docs.n8n.io/integrations/creating-nodes/build/trigger-node/)
- [Dynamic Load Options](https://docs.n8n.io/integrations/creating-nodes/code/node-parameters/load-options/)

---

## ✅ Acceptance Criteria

### Feature Completion
- [ ] Upsert operations for all main modules
- [ ] Deleted records retrieval implemented
- [ ] Module/field metadata retrieval
- [ ] Organization info retrieval
- [ ] Webhooks (if implemented)
- [ ] Rate limiting with retry logic
- [ ] Response caching
- [ ] Error recovery mechanisms

### Quality Standards
- [ ] All operations properly tested
- [ ] Error handling comprehensive
- [ ] Rate limits respected
- [ ] Cache invalidation working
- [ ] Metrics/logging in place
- [ ] Documentation complete
- [ ] Performance benchmarks met

---

## 🧪 Testing Checklist

### Upsert Operations
- [ ] Upsert creates new record when not exists
- [ ] Upsert updates existing record
- [ ] Duplicate check on single field
- [ ] Duplicate check on multiple fields
- [ ] Invalid duplicate check field (error)

### Deleted Records
- [ ] List all deleted records
- [ ] Filter by deletion type (recycle/permanent)
- [ ] Pagination works correctly
- [ ] Empty result handling

### Modules & Settings
- [ ] Get all modules
- [ ] Get specific module metadata
- [ ] Get fields for module
- [ ] Get organization info
- [ ] Cache invalidation on TTL

### Performance
- [ ] Rate limit retry logic
- [ ] Cache hit/miss scenarios
- [ ] Batch operation splitting
- [ ] Error recovery with backoff
- [ ] Metrics logging

---

## 📦 Files to Modify

### Main Files
- `nodes/ZohoBigin.node.ts` - Add new operations
- `nodes/descriptions/BiginContactsDescription.ts` - Add upsert params
- `nodes/descriptions/BiginPipelinesDescription.ts` - Add upsert params
- `nodes/GenericFunctions.ts` - Add helper functions

### New Files (Optional)
- `nodes/ZohoBiginTrigger.node.ts` - Webhook trigger node (if implemented)
- `nodes/descriptions/BiginTriggerDescription.ts` - Trigger params

### Documentation
- `docs/Bigin.md` - Add sections for new operations
- `docs/BIGIN_EXAMPLES.md` - Add examples for upsert, COQL, etc.

---

## 🔮 Future Enhancements (Phase 9+)

Consider for later phases:

1. **Blueprint Support**: Automation templates
2. **Workflow Rules API**: Create/manage automation rules
3. **Assignment Rules**: Auto-assign records
4. **Territory Management**: Geographic territory assignment
5. **Mass Operations**: Mass update, delete, transfer
6. **Import/Export**: CSV import/export
7. **Sandbox Support**: Test environment integration
8. **Multi-user Support**: User and role management APIs
9. **Custom Functions**: Execute custom Deluge scripts
10. **Analytics API**: Get reports and dashboards data

---

**Previous Phase**: [Phase 7: Secondary APIs & Advanced Operations](./phase-7-secondary-apis.md)

**Status**: 📝 **Planned** - Documentation Complete

**Estimated Version**: 1.6 (Additional APIs Complete)

**Estimated Lines of Code**: ~1,000-1,200 (including handlers, descriptions, optimizations)

**Note**: This phase completes the comprehensive Bigin integration with all remaining API operations and production-ready performance enhancements. COQL (advanced querying) was already implemented separately in branch `claude/add-coql-support-01JG4dhKCAefmuXiuUYCYZMr`. After Phase 8, the integration will support virtually all Bigin use cases.
