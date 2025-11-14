# Phase 6: Advanced Features (Optional)

> Enhanced functionality for power users and advanced use cases

## 📋 Overview

Phase 6 is optional and focuses on advanced features that enhance the Bigin integration but aren't required for basic functionality. These features provide additional value for power users and complex workflows.

**Priority**: Low (Optional)
**Estimated Effort**: 4-8 hours (depending on features implemented)
**Dependencies**: Phases 1-5 complete
**Blocks**: None (these are enhancements)

## 🎯 Objectives

1. 🔄 Implement COQL (Zoho Common Query Language) support
2. 🔗 Add webhook/trigger node functionality
3. 📦 Support bulk operations optimization
4. 🔍 Implement advanced filtering
5. 📊 Add field metadata retrieval
6. 🎨 Custom view support
7. ⚡ Performance optimizations

## 🚀 Feature 1: COQL Query Support

### Overview

COQL (Zoho Common Query Language) allows SQL-like queries against Bigin data, enabling complex filtering and joins.

### API Endpoint

```
POST /bigin/v2/coql
```

### Implementation

#### Add to Pipeline Description

```typescript
{
    name: 'Execute COQL Query',
    value: 'executeCOQL',
    description: 'Execute a COQL query for advanced filtering',
}
```

#### Add COQL Fields

```typescript
{
    displayName: 'COQL Query',
    name: 'coqlQuery',
    type: 'string',
    typeOptions: {
        rows: 4,
    },
    required: true,
    displayOptions: {
        show: {
            resource: ['pipeline', 'contact', 'account'],
            operation: ['executeCOQL'],
        },
    },
    default: 'SELECT First_Name, Last_Name, Email FROM Contacts WHERE Email IS NOT NULL LIMIT 10',
    description: 'SQL-like query to execute. See <a href="https://www.bigin.com/developer/docs/apis/v2/coql-overview.html">COQL documentation</a> for syntax.',
    placeholder: 'SELECT Deal_Name, Stage, Amount FROM Pipelines WHERE Amount > 1000',
}
```

#### Handler Implementation

```typescript
} else if (operation === 'executeCOQL') {
    const coqlQuery = this.getNodeParameter('coqlQuery', itemIndex) as string;

    const body = {
        select_query: coqlQuery,
    };

    const response = await zohoBiginApiRequest.call(
        this,
        'POST',
        '/coql',
        body,
        {},
    );

    return response.data || [];
}
```

### Example COQL Queries

```sql
-- Get high-value pipelines
SELECT Deal_Name, Stage, Amount, Closing_Date
FROM Pipelines
WHERE Amount > 5000 AND Stage != 'Closed Lost'
ORDER BY Amount DESC
LIMIT 100

-- Find contacts from specific company
SELECT First_Name, Last_Name, Email, Phone
FROM Contacts
WHERE Account_Name.Account_Name = 'Acme Corp'

-- Get overdue tasks
SELECT Subject, Due_Date, Related_To
FROM Tasks
WHERE Status != 'Completed' AND Due_Date < TODAY

-- Complex join query
SELECT c.First_Name, c.Last_Name, p.Deal_Name, p.Amount
FROM Contacts c
JOIN Pipelines p ON p.Contact_Name = c.id
WHERE p.Stage = 'Negotiation'
```

### Benefits

- ✅ Complex multi-field filtering
- ✅ Joins across modules
- ✅ Aggregations (COUNT, SUM, AVG)
- ✅ More efficient than multiple API calls
- ✅ Familiar SQL syntax

---

## 🔗 Feature 2: Webhook/Trigger Node

### Overview

Bigin supports webhooks for real-time notifications when records are created, updated, or deleted.

### Implementation Options

#### Option A: n8n Trigger Node

Create `nodes/ZohoBiginTrigger.node.ts`:

```typescript
import type {
    IHookFunctions,
    IWebhookFunctions,
    INodeType,
    INodeTypeDescription,
    IWebhookResponseData,
} from 'n8n-workflow';

export class ZohoBiginTrigger implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Bigin Trigger',
        name: 'zohoBiginTrigger',
        icon: 'file:zoho.svg',
        group: ['trigger'],
        version: 1,
        description: 'Starts workflow on Bigin events',
        defaults: {
            name: 'Zoho Bigin Trigger',
        },
        inputs: [],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'zohoApi',
                required: true,
            },
        ],
        webhooks: [
            {
                name: 'default',
                httpMethod: 'POST',
                responseMode: 'onReceived',
                path: 'webhook',
            },
        ],
        properties: [
            {
                displayName: 'Module',
                name: 'module',
                type: 'options',
                options: [
                    { name: 'Pipelines', value: 'Pipelines' },
                    { name: 'Contacts', value: 'Contacts' },
                    { name: 'Accounts', value: 'Accounts' },
                    { name: 'Products', value: 'Products' },
                ],
                default: 'Pipelines',
            },
            {
                displayName: 'Events',
                name: 'events',
                type: 'multipleValueSlim',
                options: [
                    { name: 'Record Created', value: 'create' },
                    { name: 'Record Updated', value: 'update' },
                    { name: 'Record Deleted', value: 'delete' },
                ],
                default: ['create', 'update'],
            },
        ],
    };

    // Webhook methods
    webhookMethods = {
        default: {
            async checkExists(this: IHookFunctions): Promise<boolean> {
                // Check if webhook is registered
                const webhookUrl = this.getNodeWebhookUrl('default');
                // Query Bigin for existing webhooks
                // Return true if exists
                return false;
            },
            async create(this: IHookFunctions): Promise<boolean> {
                // Register webhook with Bigin
                const webhookUrl = this.getNodeWebhookUrl('default');
                const module = this.getNodeParameter('module') as string;
                const events = this.getNodeParameter('events') as string[];

                // API call to create webhook
                // POST /settings/actions/watch
                return true;
            },
            async delete(this: IHookFunctions): Promise<boolean> {
                // Unregister webhook
                // DELETE /settings/actions/watch/{watchId}
                return true;
            },
        },
    };

    async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
        const bodyData = this.getBodyData();

        // Process webhook data
        // Bigin sends data in specific format

        return {
            workflowData: [
                this.helpers.returnJsonArray(bodyData as IDataObject[]),
            ],
        };
    }
}
```

#### Register Webhook with Bigin

API endpoint:
```
POST https://www.zohoapis.com/bigin/v2/settings/actions/watch
```

Request body:
```json
{
    "watch": [
        {
            "channel_id": "1000000068001",
            "events": ["Contacts.create", "Contacts.edit"],
            "channel_expiry": "2025-12-31T23:59:59+05:30",
            "token": "bigin.webhook.12345",
            "notify_url": "https://n8n.example.com/webhook/zoho-bigin"
        }
    ]
}
```

### Benefits

- ✅ Real-time workflow triggers
- ✅ No polling required
- ✅ Instant notifications
- ✅ Reduced API calls

---

## 📦 Feature 3: Bulk Operations Optimization

### Overview

Optimize bulk create/update/delete operations to use Bigin's bulk APIs more efficiently.

### Implementation

#### Bulk Create (up to 100 records)

```typescript
else if (operation === 'bulkCreateContacts') {
    const contactsData = this.getNodeParameter('contactsData', itemIndex) as string;

    let contacts: IDataObject[] = [];
    try {
        contacts = JSON.parse(contactsData);
    } catch (error) {
        throw new NodeOperationError(
            this.getNode(),
            'Contacts data must be valid JSON array',
        );
    }

    // Bigin allows up to 100 records per request
    const batchSize = 100;
    const results: IDataObject[] = [];

    for (let i = 0; i < contacts.length; i += batchSize) {
        const batch = contacts.slice(i, i + batchSize);

        const body = {
            data: batch.map(contact => ({
                First_Name: contact.firstName,
                Last_Name: contact.lastName,
                Email: contact.email,
                // ... map fields
            })),
        };

        const response = await zohoBiginApiRequest.call(
            this,
            'POST',
            '/Contacts',
            body,
            {},
        );

        results.push(...(response.data || []));

        // Rate limiting: wait between batches
        if (i + batchSize < contacts.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    return results;
}
```

### Benefits

- ✅ Process up to 100 records per API call
- ✅ Automatic batching for larger datasets
- ✅ Rate limiting between batches
- ✅ Progress tracking

---

## 🔍 Feature 4: Advanced Filtering

### Overview

Enhance filtering with operators and complex conditions.

### Implementation

#### Enhanced Filter Structure

```typescript
{
    displayName: 'Advanced Filters',
    name: 'advancedFilters',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    placeholder: 'Add Filter',
    options: [
        {
            name: 'filter',
            displayName: 'Filter',
            values: [
                {
                    displayName: 'Field',
                    name: 'field',
                    type: 'string',
                    default: '',
                    description: 'Field name to filter on',
                },
                {
                    displayName: 'Operator',
                    name: 'operator',
                    type: 'options',
                    options: [
                        { name: 'Equals', value: 'equals' },
                        { name: 'Not Equals', value: 'not_equals' },
                        { name: 'Contains', value: 'contains' },
                        { name: 'Does Not Contain', value: 'not_contains' },
                        { name: 'Starts With', value: 'starts_with' },
                        { name: 'Ends With', value: 'ends_with' },
                        { name: 'Greater Than', value: 'greater_than' },
                        { name: 'Less Than', value: 'less_than' },
                        { name: 'Between', value: 'between' },
                        { name: 'In', value: 'in' },
                        { name: 'Is Empty', value: 'is_empty' },
                        { name: 'Is Not Empty', value: 'is_not_empty' },
                    ],
                    default: 'equals',
                },
                {
                    displayName: 'Value',
                    name: 'value',
                    type: 'string',
                    default: '',
                },
            ],
        },
    ],
}
```

#### Build Criteria String

```typescript
private buildCriteriaString(filters: IDataObject[]): string {
    const conditions: string[] = [];

    filters.forEach((filter: IDataObject) => {
        const field = filter.field as string;
        const operator = filter.operator as string;
        const value = filter.value as string;

        let condition = '';
        switch (operator) {
            case 'equals':
                condition = `(${field}:equals:${value})`;
                break;
            case 'contains':
                condition = `(${field}:contains:${value})`;
                break;
            case 'greater_than':
                condition = `(${field}:greater_than:${value})`;
                break;
            // ... more operators
        }

        if (condition) {
            conditions.push(condition);
        }
    });

    return conditions.join(' AND ');
}
```

---

## 📊 Feature 5: Field Metadata Retrieval

### Overview

Allow users to retrieve available fields for each module dynamically.

### Implementation

#### Add Operation

```typescript
{
    name: 'Get Fields',
    value: 'getFields',
    description: 'Get metadata for all fields in a module',
}
```

#### Handler

```typescript
else if (operation === 'getFields') {
    const module = this.getNodeParameter('module', itemIndex) as string;

    const response = await zohoBiginApiRequest.call(
        this,
        'GET',
        `/settings/fields?module=${module}`,
        {},
        {},
    );

    return response.fields || [];
}
```

### Use Cases

- Dynamic form generation
- Field validation
- Custom field discovery
- Integration configuration

---

## 🎨 Feature 6: Custom Views Support

### Overview

Bigin custom views allow users to save filtered/sorted views of data. Support retrieving records from specific custom views.

### Implementation

```typescript
{
    displayName: 'Custom View ID',
    name: 'customViewId',
    type: 'string',
    default: '',
    displayOptions: {
        show: {
            resource: ['pipeline', 'contact', 'account'],
            operation: ['list'],
        },
    },
    description: 'ID of custom view to retrieve records from',
}
```

Handler:
```typescript
const customViewId = this.getNodeParameter('customViewId', itemIndex, '') as string;

if (customViewId) {
    qs.cvid = customViewId;
}
```

---

## ⚡ Feature 7: Performance Optimizations

### 1. Request Caching

Cache metadata requests (fields, modules, etc.):

```typescript
private metadataCache: Map<string, { data: IDataObject; expiry: number }> = new Map();

private async getCachedMetadata(key: string, fetcher: () => Promise<IDataObject>): Promise<IDataObject> {
    const cached = this.metadataCache.get(key);
    const now = Date.now();

    if (cached && cached.expiry > now) {
        return cached.data;
    }

    const data = await fetcher();
    this.metadataCache.set(key, {
        data,
        expiry: now + (60 * 60 * 1000), // 1 hour
    });

    return data;
}
```

### 2. Parallel Requests

For independent operations, execute in parallel:

```typescript
const [contacts, accounts, pipelines] = await Promise.all([
    zohoBiginApiRequest.call(this, 'GET', '/Contacts', {}, {}),
    zohoBiginApiRequest.call(this, 'GET', '/Accounts', {}, {}),
    zohoBiginApiRequest.call(this, 'GET', '/Pipelines', {}, {}),
]);
```

### 3. Pagination Optimization

Fetch all pages automatically:

```typescript
async function fetchAllPages(
    this: IExecuteFunctions,
    endpoint: string,
    itemIndex: number,
): Promise<IDataObject[]> {
    let allData: IDataObject[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            endpoint,
            {},
            { page, per_page: 200 },
        );

        const data = response.data || [];
        allData = allData.concat(data);

        hasMore = data.length === 200; // Has more if we got full page
        page++;

        if (hasMore) {
            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    return allData;
}
```

---

## 📋 Implementation Priority

Recommended implementation order:

1. **COQL Support** (High value, moderate effort)
2. **Bulk Operations** (High value, moderate effort)
3. **Advanced Filtering** (Medium value, low effort)
4. **Field Metadata** (Medium value, low effort)
5. **Performance Optimizations** (Medium value, moderate effort)
6. **Custom Views** (Low value, low effort)
7. **Webhooks/Triggers** (High value, high effort)

---

## 📋 Acceptance Criteria

For each implemented feature:

1. ✅ **Feature documented** in code comments
2. ✅ **User documentation updated** in README
3. ✅ **Examples provided**
4. ✅ **Tested with real API**
5. ✅ **Error handling implemented**
6. ✅ **Performance acceptable**
7. ✅ **No regression** in existing functionality

---

## 💡 Future Enhancements

Additional features to consider:

- **File Attachments**: Upload/download attachments to records
- **Related Records**: Retrieve related lists (contacts for account, etc.)
- **Duplicate Detection**: Check for duplicates before creating
- **Field Mapping Templates**: Save common field mappings
- **Scheduled Reports**: Generate and email reports
- **Data Validation**: Advanced validation before API calls
- **Undo Operations**: Implement undo for delete operations
- **Audit Logs**: Track all API operations
- **Custom Functions**: Allow users to write custom JavaScript transforms
- **AI Integration**: Use AI to suggest field mappings or data cleanup

---

## ✅ Completion Checklist

For Phase 6 (select features to implement):

- [ ] COQL support implemented and tested
- [ ] Bulk operations optimized
- [ ] Advanced filtering working
- [ ] Field metadata retrieval functional
- [ ] Custom views supported
- [ ] Performance optimizations applied
- [ ] Webhook trigger node created (optional)
- [ ] All features documented
- [ ] Examples provided for each feature
- [ ] No performance degradation
- [ ] User feedback collected
- [ ] Ready for production

---

## 🎓 Learning Resources

- **Bigin API Documentation**: https://www.bigin.com/developer/docs/apis/v2/
- **COQL Documentation**: https://www.bigin.com/developer/docs/apis/v2/coql-overview.html
- **Webhooks Guide**: https://www.bigin.com/developer/docs/apis/v2/notifications.html
- **Bulk APIs**: https://www.bigin.com/developer/docs/apis/v2/bulk-write.html

---

**Previous Phase**: [Phase 5: Testing & Documentation](./phase-5-testing.md)

**Related Modules**: All modules benefit from these features

**Status**: 📝 Documentation Complete - Optional Implementation

**Note**: Phase 6 features are optional enhancements. The core Bigin integration is fully functional after Phase 5.
