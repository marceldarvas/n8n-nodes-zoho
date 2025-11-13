# Quick Start: Adding a New Zoho Node

This is a condensed checklist for experienced developers. For detailed explanations, see [ADDING_NEW_ZOHO_APPS.md](./ADDING_NEW_ZOHO_APPS.md).

## Pre-Implementation Checklist

- [ ] Review Zoho API documentation for the service
- [ ] Identify OAuth2 scope (e.g., `ZohoService.operation.ALL`)
- [ ] Document API endpoints and data structures
- [ ] Determine base URL (e.g., `https://calendar.zoho.com`)

## Implementation Checklist

### 1. Update OAuth Scope
**File**: `credentials/ZohoApi.credentials.ts`

```typescript
default: 'existing.scopes,ZohoYourService.operation.ALL'
```

### 2. Create Node File
**File**: `nodes/ZohoYourService.node.ts`

```typescript
import { IExecuteFunctions, INodeType, INodeTypeDescription, NodeConnectionType } from 'n8n-workflow';
import { zohoApiRequest } from './GenericFunctions';

export class ZohoYourService implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Your Service',
        name: 'zohoYourService',
        icon: 'file:zoho.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Consume Zoho Your Service API',
        defaults: { name: 'Zoho Your Service' },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [{ name: 'zohoApi', required: true }],
        properties: [
            // Define operations and parameters
        ],
    };

    async execute(this: IExecuteFunctions) {
        // Implementation
    }
}
```

### 3. Define Operations
```typescript
properties: [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
            { name: 'Create', value: 'create' },
            { name: 'Get', value: 'get' },
            { name: 'Update', value: 'update' },
            { name: 'Delete', value: 'delete' },
            { name: 'List', value: 'list' },
        ],
        default: 'create',
    },
    {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        default: '{}',
        displayOptions: {
            show: { operation: ['create', 'update'] },
        },
    },
]
```

### 4. Implement Execute Function
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
        try {
            const response = await zohoApiRequest.call(
                this,
                'POST',
                'https://service.zoho.com',
                '/api/v1/endpoint',
                JSON.parse(this.getNodeParameter('jsonData', i) as string)
            );
            returnData.push({ json: response });
        } catch (error) {
            if (this.continueOnFail()) {
                returnData.push({ json: { error: error.message } });
                continue;
            }
            throw error;
        }
    }
    return [returnData];
}
```

### 5. Register in package.json
```json
"n8n": {
    "nodes": [
        "...",
        "dist/nodes/Zoho/ZohoYourService.node.js"
    ]
}
```

### 6. Create API Documentation
**File**: `docs/YourService.md`

Document all endpoints, parameters, and usage examples.

### 7. Update README
Add your node to the "Available Nodes" section.

## Build & Test

```bash
# Build
npm run build

# Test locally
npm link
cd ~/.n8n/custom
npm link n8n-nodes-zoho
n8n start
```

## Testing Checklist

- [ ] All operations work
- [ ] Error handling functional
- [ ] OAuth authentication successful
- [ ] Parameters show/hide correctly
- [ ] Multiple items process correctly
- [ ] Continue on fail works
- [ ] Edge cases handled

## Common API Patterns

### Basic Request
```typescript
await zohoApiRequest.call(this, 'GET', baseURL, '/api/v1/resource', {}, qs);
```

### With Body
```typescript
await zohoApiRequest.call(this, 'POST', baseURL, '/api/v1/resource', body);
```

### With Query Parameters
```typescript
await zohoApiRequest.call(this, 'GET', baseURL, '/api/v1/resource', {}, { limit: 100 });
```

## Common Base URLs

| Service | Base URL |
|---------|----------|
| Tasks | `https://mail.zoho.com` |
| Sheets | `https://sheet.zoho.com` |
| Billing | `https://billing.zoho.com` |
| Calendar | `https://calendar.zoho.com` |
| CRM | `https://www.zohoapis.com` |

## Commit & Push

```bash
git add .
git commit -m "feat: add Zoho Your Service node"
git push
```

## Reference

- **Detailed Guide**: [ADDING_NEW_ZOHO_APPS.md](./ADDING_NEW_ZOHO_APPS.md)
- **Example Implementation**: [Zoho Calendar](https://github.com/liamdmcgarrigle/n8n-nodes-zoho-calendar)
- **Existing Nodes**: Check `nodes/ZohoTasks.node.ts` or other nodes in the repository
