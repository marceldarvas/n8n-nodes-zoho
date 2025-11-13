# Adding New Zoho Applications to n8n-nodes-zoho

This guide documents the official implementation pattern for adding new Zoho applications to this repository, based on the Zoho Calendar implementation from [liamdmcgarrigle/n8n-nodes-zoho-calendar](https://github.com/liamdmcgarrigle/n8n-nodes-zoho-calendar).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Implementation Steps](#implementation-steps)
4. [File Structure](#file-structure)
5. [Code Templates](#code-templates)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [Best Practices](#best-practices)

## Overview

Adding a new Zoho application follows a consistent pattern across all nodes in this repository:

- **Shared Authentication**: All nodes use the centralized `ZohoApi.credentials.ts`
- **Generic Functions**: Common API request logic in `GenericFunctions.ts`
- **Node-Specific Implementation**: Each Zoho service gets its own `.node.ts` file
- **Type Safety**: TypeScript types defined in `types.ts`
- **Consistent Naming**: Follow the `Zoho{ServiceName}.node.ts` convention

## Prerequisites

Before implementing a new Zoho application node:

1. **Zoho API Documentation**: Review the official Zoho API documentation for the service
2. **OAuth Scopes**: Identify required OAuth2 scopes for the service
3. **API Endpoints**: Document all API endpoints you plan to support
4. **Data Structures**: Understand request/response formats
5. **Development Environment**: Have n8n development environment set up

### Required Tools

- Node.js 16+
- TypeScript knowledge
- n8n-workflow package
- Access to Zoho Developer Console

## Implementation Steps

### Step 1: Update OAuth Scopes

Add the required OAuth scope to `credentials/ZohoApi.credentials.ts`:

```typescript
{
    displayName: 'Scope',
    name: 'scope',
    type: 'string',
    default: 'ZohoCRM.modules.ALL,...,YourNewService.operation.ALL',
}
```

**Example Scopes:**
- Zoho Tasks: `ZohoMail.tasks.ALL`
- Zoho Sheets: `ZohoSheet.dataAPI.ALL`
- Zoho Billing: `ZohoSubscriptions.fullaccess.ALL`
- Zoho Calendar: `ZohoCalendar.event.ALL`
- Zoho Mail: `ZohoMail.messages.ALL`

### Step 2: Create the Node File

Create a new file `nodes/Zoho{ServiceName}.node.ts`:

```typescript
import {
    type IExecuteFunctions,
    type IDataObject,
    type INodeExecutionData,
    type INodeType,
    type INodeTypeDescription,
    NodeConnectionType
} from 'n8n-workflow';

import { zohoApiRequest } from './GenericFunctions';

export class Zoho{ServiceName} implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho {Service Name}',
        name: 'zoho{ServiceName}',
        icon: 'file:zoho.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Consume Zoho {Service Name} API',
        defaults: {
            name: 'Zoho {Service Name}',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [
            {
                name: 'zohoApi',
                required: true,
            },
        ],
        properties: [
            // Define your operations and parameters here
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Implementation
    }
}
```

### Step 3: Define Operations and Parameters

In the `properties` array, define all operations and their parameters:

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
    // Add resource-specific parameters
    {
        displayName: 'Resource ID',
        name: 'resourceId',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: ['get', 'update', 'delete'],
            },
        },
        description: 'The ID of the resource',
    },
    // JSON data parameter for flexible input
    {
        displayName: 'JSON Data',
        name: 'jsonData',
        type: 'json',
        default: '{}',
        displayOptions: {
            show: {
                operation: ['create', 'update'],
            },
        },
        description: 'JSON data for the operation',
    },
]
```

### Step 4: Implement the Execute Function

The execute function processes the operations:

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
        try {
            if (operation === 'create') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                const body = JSON.parse(jsonData);

                const response = await zohoApiRequest.call(
                    this,
                    'POST',
                    'https://api.zoho.com',
                    '/your-service/api/v1/resource',
                    body
                );

                returnData.push({ json: response });
            }
            // Handle other operations...
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

### Step 5: API Base URL Configuration

Different Zoho services use different base URLs. Common patterns:

```typescript
// Zoho Tasks
const baseURL = 'https://mail.zoho.com';

// Zoho Sheets
const baseURL = 'https://sheet.zoho.com';

// Zoho Billing
const baseURL = 'https://billing.zoho.com';

// Zoho Calendar
const baseURL = 'https://calendar.zoho.com';
```

Use the `zohoApiRequest` function from `GenericFunctions.ts` which handles authentication automatically:

```typescript
const response = await zohoApiRequest.call(
    this,
    'GET',                                    // HTTP method
    'https://calendar.zoho.com',              // Base URL
    '/api/v1/events',                         // Endpoint path
    {},                                       // Body (for POST/PUT)
    { date_from: '2024-01-01' }              // Query parameters
);
```

### Step 6: Register the Node

Add your new node to `package.json`:

```json
"n8n": {
    "credentials": [
        "dist/credentials/ZohoApi.credentials.js"
    ],
    "nodes": [
        "dist/nodes/Zoho/ZohoSheets.node.js",
        "dist/nodes/Zoho/ZohoBilling.node.js",
        "dist/nodes/Zoho/ZohoTasks.node.js",
        "dist/nodes/Zoho/ZohoEmail.node.js",
        "dist/nodes/Zoho/ZohoYourNewService.node.js"
    ]
}
```

## File Structure

The repository follows this structure:

```
n8n-nodes-zoho/
├── credentials/
│   └── ZohoApi.credentials.ts       # Shared OAuth2 credentials
├── nodes/
│   ├── GenericFunctions.ts          # Shared API request functions
│   ├── types.ts                      # TypeScript type definitions
│   ├── ZohoSheets.node.ts
│   ├── ZohoBilling.node.ts
│   ├── ZohoTasks.node.ts
│   ├── ZohoEmail.node.ts
│   └── ZohoYourNew.node.ts          # Your new node
├── docs/
│   ├── Tasks.md                      # API documentation
│   ├── Email.md
│   └── YourNew.md                    # Document your API
├── dist/                             # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

## Code Templates

### Basic CRUD Operations Template

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
        try {
            let response;

            switch (operation) {
                case 'create': {
                    const jsonData = this.getNodeParameter('jsonData', i) as string;
                    const body = JSON.parse(jsonData);

                    response = await zohoApiRequest.call(
                        this,
                        'POST',
                        'https://api.zoho.com',
                        '/service/api/v1/resource',
                        body
                    );
                    break;
                }

                case 'get': {
                    const resourceId = this.getNodeParameter('resourceId', i) as string;

                    response = await zohoApiRequest.call(
                        this,
                        'GET',
                        'https://api.zoho.com',
                        `/service/api/v1/resource/${resourceId}`
                    );
                    break;
                }

                case 'update': {
                    const resourceId = this.getNodeParameter('resourceId', i) as string;
                    const jsonData = this.getNodeParameter('jsonData', i) as string;
                    const body = JSON.parse(jsonData);

                    response = await zohoApiRequest.call(
                        this,
                        'PUT',
                        'https://api.zoho.com',
                        `/service/api/v1/resource/${resourceId}`,
                        body
                    );
                    break;
                }

                case 'delete': {
                    const resourceId = this.getNodeParameter('resourceId', i) as string;

                    response = await zohoApiRequest.call(
                        this,
                        'DELETE',
                        'https://api.zoho.com',
                        `/service/api/v1/resource/${resourceId}`
                    );
                    break;
                }

                case 'list': {
                    const qs: IDataObject = {};

                    // Add pagination parameters if needed
                    if (this.getNodeParameter('limit', i, undefined)) {
                        qs.limit = this.getNodeParameter('limit', i);
                    }

                    response = await zohoApiRequest.call(
                        this,
                        'GET',
                        'https://api.zoho.com',
                        '/service/api/v1/resource',
                        {},
                        qs
                    );
                    break;
                }

                default:
                    throw new Error(`Operation "${operation}" is not supported`);
            }

            returnData.push({ json: response });

        } catch (error) {
            if (this.continueOnFail()) {
                returnData.push({
                    json: {
                        error: error.message,
                        operation,
                        item: i
                    }
                });
                continue;
            }
            throw error;
        }
    }

    return [returnData];
}
```

### Advanced Parameter Configuration Template

```typescript
{
    displayName: 'Filters',
    name: 'filters',
    type: 'fixedCollection',
    typeOptions: {
        multipleValues: true,
    },
    default: {},
    displayOptions: {
        show: {
            operation: ['list'],
        },
    },
    options: [
        {
            displayName: 'Filter',
            name: 'filter',
            values: [
                {
                    displayName: 'Field',
                    name: 'field',
                    type: 'options',
                    options: [
                        { name: 'Name', value: 'name' },
                        { name: 'Status', value: 'status' },
                        { name: 'Created Date', value: 'created_date' },
                    ],
                    default: 'name',
                },
                {
                    displayName: 'Operator',
                    name: 'operator',
                    type: 'options',
                    options: [
                        { name: 'Equals', value: 'eq' },
                        { name: 'Contains', value: 'contains' },
                        { name: 'Greater Than', value: 'gt' },
                    ],
                    default: 'eq',
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

## Testing

### Local Testing Steps

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Link to n8n (for development):**
   ```bash
   npm link
   cd ~/.n8n/custom
   npm link n8n-nodes-zoho
   ```

3. **Restart n8n:**
   ```bash
   n8n start
   ```

4. **Test in n8n UI:**
   - Create a new workflow
   - Add your new Zoho node
   - Configure credentials
   - Test each operation
   - Verify response data

### Test Checklist

- [ ] All operations execute successfully
- [ ] Error handling works correctly
- [ ] Parameters show/hide based on operation
- [ ] OAuth authentication works
- [ ] API responses are properly formatted
- [ ] Edge cases handled (empty responses, null values, etc.)
- [ ] Continue on fail option works
- [ ] Multiple items processing works

## Documentation

### API Documentation Template

Create a file `docs/{ServiceName}.md` following this structure:

```markdown
# {Service Name} API

## Overview

Brief description of the service and what the node enables.

## Authentication

OAuth Scope required: `Zoho{Service}.operation.ALL`

## API Endpoints

### Operation Name

* **Method:** `GET/POST/PUT/DELETE`
* **Purpose:** Description of what this operation does
* **OAuth Scope:** `Zoho{Service}.operation.ALL`
* **Endpoint:** `/api/v1/resource`
* **Path Parameters:**
  * `{param}`: Description
* **Query Parameters:**
  * `param`: Description
* **Request Body:** Required/Optional
* **Response:** Description of response format

---

(Repeat for each operation)

## Usage Examples

### Example 1: Create a Resource

```javascript
Operation: "Create"
JSON Data: '{"name":"Example","status":"active"}'
```

### Example 2: List Resources

```javascript
Operation: "List"
Filters: [
  { field: 'status', operator: 'eq', value: 'active' }
]
```

## API Limits

Document any rate limits or restrictions.

## References

- [Official API Documentation](https://www.zoho.com/...)
```

### README Update

Add your new node to the "Available Nodes" section in `README.md`:

```markdown
### 📅 Zoho {Service Name}
Description of capabilities:
- CRUD operations
- Key features
- Special functionality
```

## Best Practices

### Code Quality

1. **Type Safety**: Use TypeScript types for all parameters and responses
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Parameter Validation**: Validate required parameters before API calls
4. **Descriptive Names**: Use clear, descriptive names for operations and parameters
5. **Comments**: Add comments for complex logic

### API Integration

1. **Use GenericFunctions**: Always use `zohoApiRequest` for API calls
2. **Consistent Naming**: Follow naming conventions from existing nodes
3. **JSON Parameters**: Use JSON input for complex data structures
4. **Display Options**: Use `displayOptions` to show/hide relevant parameters
5. **Default Values**: Provide sensible defaults for all parameters

### User Experience

1. **Clear Descriptions**: Write helpful parameter descriptions
2. **Validation Messages**: Provide clear error messages
3. **Progressive Disclosure**: Only show relevant parameters
4. **Examples**: Include example values in descriptions
5. **Documentation**: Link to official API docs in parameter hints

### Performance

1. **Batch Processing**: Support multiple items in execution
2. **Pagination**: Implement pagination for list operations
3. **Caching**: Consider caching for frequently accessed data
4. **Rate Limiting**: Respect API rate limits

### Security

1. **No Hardcoded Credentials**: Always use credential system
2. **Sensitive Data**: Don't log sensitive information
3. **Input Sanitization**: Validate and sanitize user inputs
4. **OAuth Scopes**: Request minimal required scopes

## Example: Zoho Calendar Implementation

Based on the [official Zoho Calendar implementation](https://github.com/liamdmcgarrigle/n8n-nodes-zoho-calendar), here are the key patterns:

### Authentication Setup

```typescript
credentials: [
    {
        name: 'zohoApi',
        required: true,
    },
]
```

### Operations Structure

```typescript
options: [
    { name: 'Create Event', value: 'createEvent' },
    { name: 'Update Event', value: 'updateEvent' },
    { name: 'Delete Event', value: 'deleteEvent' },
    { name: 'Get Event', value: 'getEvent' },
    { name: 'List Events', value: 'listEvents' },
    { name: 'Move Event', value: 'moveEvent' },
    { name: 'Download Attachment', value: 'downloadAttachment' },
]
```

### Key Implementation Details

1. **Time Zone Handling**: Default to UTC when not specified
2. **Search Constraints**: Limit search ranges (e.g., 31 days for Calendar)
3. **Chronological Ordering**: Return results in logical order
4. **UID Management**: Retrieve and manage resource UIDs from responses
5. **Attachment Support**: Handle file uploads and downloads

## Resources

- [n8n Node Development Documentation](https://docs.n8n.io/integrations/creating-nodes/)
- [Zoho API Documentation](https://www.zoho.com/developer/)
- [Zoho Developer Console](https://api-console.zoho.com/)
- [n8n Community Forum](https://community.n8n.io/)
- [Reference Implementation: Zoho Calendar](https://github.com/liamdmcgarrigle/n8n-nodes-zoho-calendar)

## Support

- **Issues**: [GitHub Issues](https://github.com/vladaman/n8n-nodes-zoho/issues)
- **Discussions**: [n8n Community](https://community.n8n.io/)
- **Documentation**: Check `docs/` folder for service-specific guides

## Contributing

When contributing a new Zoho application:

1. Follow this implementation guide
2. Include comprehensive tests
3. Document the API in `docs/`
4. Update the main README.md
5. Ensure TypeScript compilation succeeds
6. Run linting: `npm run tslint`
7. Test thoroughly in n8n
8. Submit a pull request with clear description

---

**Last Updated**: Based on Zoho Calendar implementation pattern
**Maintained By**: n8n-nodes-zoho contributors
