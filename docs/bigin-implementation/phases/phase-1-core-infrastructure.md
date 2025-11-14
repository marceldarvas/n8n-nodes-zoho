# Phase 1: Zoho Bigin Core Infrastructure

## Overview

Phase 1 establishes the foundational infrastructure for Zoho Bigin integration in n8n-nodes-zoho. This phase focuses on setting up authentication, basic node structure, and implementing core CRUD operations for the Contacts module.

## Objectives

1. ✅ Set up OAuth2 authentication for Bigin API
2. ✅ Create base node structure following existing patterns
3. ✅ Implement Contacts resource with full CRUD operations
4. ✅ Ensure type safety and proper error handling
5. ✅ Register node in package.json for n8n integration

## What is Zoho Bigin?

**Zoho Bigin** is a lightweight CRM solution designed for small businesses and startups. It provides essential CRM capabilities including:

- **Contact Management**: Store and manage customer information
- **Pipeline Management**: Track deals through sales stages
- **Products**: Manage product catalogs
- **Activities**: Schedule and track customer interactions
- **Custom Fields**: Extend modules with custom data

### API Details

- **Base URL**: `https://www.zohoapis.com/bigin/v2/`
- **Alternative Base URL**: `https://www.zohoapis.com/bigin/v1/` (legacy)
- **Authentication**: OAuth 2.0
- **Data Format**: JSON
- **Rate Limits**: Standard Zoho API rate limits apply

### Available Modules

Bigin organizes data into modules:
- **Contacts**: People and organizations
- **Deals**: Sales opportunities
- **Products**: Product catalog
- **Activities**: Tasks, calls, events
- **Notes**: Related notes and attachments

## Technical Implementation

### Task 1: OAuth Credential Configuration

**File**: `credentials/ZohoApi.credentials.ts`

**Action**: Add Bigin OAuth scope to the existing Zoho API credentials.

**Scope Format**: `ZohoBigin.modules.ALL`

**Additional Scopes** (optional for enhanced functionality):
- `ZohoBigin.settings.ALL` - For metadata and settings
- `ZohoBigin.modules.READ` - Read-only access
- `ZohoBigin.modules.CREATE` - Create operations
- `ZohoBigin.modules.UPDATE` - Update operations
- `ZohoBigin.modules.DELETE` - Delete operations

**Implementation**:
```typescript
// Update the default scope in ZohoApi.credentials.ts
default: 'ZohoCRM.modules.ALL,ZohoSubscriptions.fullaccess.ALL,...,ZohoBigin.modules.ALL'
```

### Task 2: Create ZohoBigin Node

**File**: `nodes/ZohoBigin.node.ts`

**Description**: Create the main node file following the established pattern from other Zoho nodes (Sheets, Tasks, Billing, Email).

**Node Structure**:
```typescript
export class ZohoBigin implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Bigin',
        name: 'zohoBigin',
        icon: 'file:zoho.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
        description: 'Consume Zoho Bigin API - Lightweight CRM for small businesses',
        defaults: { name: 'Zoho Bigin' },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [{ name: 'zohoApi', required: true }],
        properties: [/* Resource and operation definitions */],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Implementation
    }
}
```

### Task 3: Implement Contacts Resource

**Resource**: Contacts (Primary focus for Phase 1)

**Operations to Implement**:

#### 1. Create Contact
- **HTTP Method**: POST
- **Endpoint**: `/bigin/v2/Contacts`
- **Description**: Create a new contact in Bigin
- **Parameters**:
  - `jsonData` (JSON): Contact data including first_name, last_name, email, phone, etc.
- **Request Body Example**:
```json
{
  "data": [{
    "First_Name": "John",
    "Last_Name": "Doe",
    "Email": "john.doe@example.com",
    "Phone": "+1-555-0123"
  }]
}
```

#### 2. Get Contact
- **HTTP Method**: GET
- **Endpoint**: `/bigin/v2/Contacts/{contact_id}`
- **Description**: Retrieve a specific contact by ID
- **Parameters**:
  - `contactId` (string, required): The unique identifier of the contact

#### 3. Update Contact
- **HTTP Method**: PUT
- **Endpoint**: `/bigin/v2/Contacts/{contact_id}`
- **Description**: Update an existing contact
- **Parameters**:
  - `contactId` (string, required): The contact ID to update
  - `jsonData` (JSON): Updated contact data

#### 4. Delete Contact
- **HTTP Method**: DELETE
- **Endpoint**: `/bigin/v2/Contacts/{contact_id}`
- **Description**: Delete a contact from Bigin
- **Parameters**:
  - `contactId` (string, required): The contact ID to delete

#### 5. List Contacts
- **HTTP Method**: GET
- **Endpoint**: `/bigin/v2/Contacts`
- **Description**: Retrieve all contacts with optional filtering
- **Parameters**:
  - `page` (number, optional): Page number for pagination (default: 1)
  - `per_page` (number, optional): Records per page (default: 200, max: 200)
  - `sort_order` (options, optional): asc or desc
  - `sort_by` (string, optional): Field to sort by

#### 6. Search Contacts
- **HTTP Method**: GET
- **Endpoint**: `/bigin/v2/Contacts/search`
- **Description**: Search contacts by criteria
- **Parameters**:
  - `criteria` (string): Search criteria (e.g., "(Email:equals:john@example.com)")
  - `page` (number, optional): Page number
  - `per_page` (number, optional): Records per page

### Task 4: Parameter Definitions

**Resource Selection**:
```typescript
{
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    noDataExpression: true,
    options: [
        {
            name: 'Contact',
            value: 'contact',
            description: 'Operations on contacts'
        },
        // Future: Deal, Product, Activity
    ],
    default: 'contact',
}
```

**Operation Selection**:
```typescript
{
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
        show: { resource: ['contact'] },
    },
    options: [
        { name: 'Create', value: 'create', description: 'Create a new contact' },
        { name: 'Get', value: 'get', description: 'Retrieve a contact' },
        { name: 'Update', value: 'update', description: 'Update a contact' },
        { name: 'Delete', value: 'delete', description: 'Delete a contact' },
        { name: 'List', value: 'list', description: 'List all contacts' },
        { name: 'Search', value: 'search', description: 'Search contacts' },
    ],
    default: 'create',
}
```

**Contact ID Parameter** (for get/update/delete):
```typescript
{
    displayName: 'Contact ID',
    name: 'contactId',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact'],
            operation: ['get', 'update', 'delete'],
        },
    },
    default: '',
    description: 'The ID of the contact',
}
```

**JSON Data Parameter** (for create/update):
```typescript
{
    displayName: 'JSON Data',
    name: 'jsonData',
    type: 'json',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact'],
            operation: ['create', 'update'],
        },
    },
    default: '{\n  "First_Name": "",\n  "Last_Name": "",\n  "Email": "",\n  "Phone": ""\n}',
    description: 'Contact data in JSON format. For create operations, wrap in data array.',
}
```

### Task 5: Execute Method Implementation

**Pattern**: Use `zohoApiRequest` from `GenericFunctions.ts`

**Base URL**: `https://www.zohoapis.com/bigin/v2`

**Example Implementation**:
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const baseURL = 'https://www.zohoapis.com/bigin/v2';

    for (let i = 0; i < items.length; i++) {
        try {
            const resource = this.getNodeParameter('resource', i) as string;
            const operation = this.getNodeParameter('operation', i) as string;

            if (resource === 'contact') {
                if (operation === 'create') {
                    const jsonData = this.getNodeParameter('jsonData', i) as string;
                    const body = JSON.parse(jsonData);

                    // Ensure data is wrapped in array
                    const requestBody = body.data ? body : { data: [body] };

                    const response = await zohoApiRequest.call(
                        this,
                        'POST',
                        baseURL,
                        '/Contacts',
                        requestBody
                    );

                    returnData.push({ json: response });
                }
                // ... other operations
            }
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

### Task 6: Package Registration

**File**: `package.json`

**Action**: Add the new node to the n8n configuration section.

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
    "dist/nodes/Zoho/ZohoBigin.node.js"
  ]
}
```

### Task 7: Type Definitions

**File**: `nodes/types.ts`

**Action**: Add TypeScript interfaces for Bigin data structures (optional but recommended).

```typescript
export interface IBiginContact {
    id?: string;
    First_Name?: string;
    Last_Name?: string;
    Full_Name?: string;
    Email?: string;
    Phone?: string;
    Mobile?: string;
    Company?: string;
    Title?: string;
    Description?: string;
    Created_Time?: string;
    Modified_Time?: string;
    Owner?: {
        id: string;
        name: string;
    };
    [key: string]: any; // For custom fields
}

export interface IBiginResponse {
    data?: any[];
    info?: {
        per_page: number;
        count: number;
        page: number;
        more_records: boolean;
    };
}
```

## Testing Checklist

### Unit Testing
- [ ] OAuth scope is correctly configured
- [ ] Node appears in n8n node palette
- [ ] All parameters show/hide correctly based on operation
- [ ] JSON validation works for create/update operations
- [ ] Error messages are clear and helpful

### Integration Testing
- [ ] Create Contact operation works
- [ ] Get Contact operation retrieves correct data
- [ ] Update Contact operation modifies data
- [ ] Delete Contact operation removes data
- [ ] List Contacts operation returns all contacts
- [ ] Search Contacts operation filters correctly
- [ ] Pagination works for List operation
- [ ] Error handling works (invalid IDs, malformed JSON, etc.)
- [ ] Continue on fail option works correctly
- [ ] Multiple items processing works

### API Testing
- [ ] OAuth authentication succeeds
- [ ] Access token refresh works
- [ ] API responses are properly formatted
- [ ] Required fields validation works
- [ ] Optional fields are handled correctly
- [ ] Custom fields can be set and retrieved

## Build and Deployment

### Build Steps
```bash
# Install dependencies (if needed)
npm install

# Run TypeScript compilation and Gulp tasks
npm run build

# Verify compilation succeeded
ls -la dist/nodes/ZohoBigin.node.js
```

### Testing in n8n
```bash
# Link package for local development
npm link
cd ~/.n8n/custom
npm link n8n-nodes-zoho

# Restart n8n
n8n start

# Test in n8n UI
# 1. Create new workflow
# 2. Add Zoho Bigin node
# 3. Configure OAuth credentials
# 4. Test each operation
```

## Success Criteria

Phase 1 is considered complete when:

1. ✅ Zoho Bigin node appears in n8n node palette
2. ✅ OAuth authentication with Bigin API works
3. ✅ All 6 Contact operations (Create, Get, Update, Delete, List, Search) function correctly
4. ✅ Error handling is robust and user-friendly
5. ✅ Code follows TypeScript strict mode and TSLint rules
6. ✅ Build process completes without errors
7. ✅ Documentation is created (this file + API docs)
8. ✅ Changes are committed to the designated branch
9. ✅ Manual testing in n8n confirms all operations work

## Future Phases

### Phase 2: Additional Resources (Planned)
- Deals resource (CRUD operations)
- Products resource (CRUD operations)
- Activities resource (CRUD operations)
- Notes resource (CRUD operations)

### Phase 3: Advanced Features (Planned)
- Bulk operations support
- Custom fields handling via resource options
- Related records (e.g., get all deals for a contact)
- File attachments support
- Webhooks for real-time updates
- COQL (Custom Object Query Language) support

### Phase 4: Optimization (Planned)
- Caching for metadata calls
- Batch API support
- Advanced filtering and search
- Field mapping and transformation
- Load options from Bigin metadata

## Documentation

### Files to Create/Update

1. **API Documentation**: `docs/Bigin.md`
   - Detailed API endpoint documentation
   - Request/response examples
   - Common use cases
   - Error codes and troubleshooting

2. **README Update**: `README.md`
   - Add Zoho Bigin to "Available Nodes" section
   - List supported operations
   - Link to Bigin.md documentation

3. **Implementation Guide**: This file
   - Phase 1 implementation steps
   - Testing procedures
   - Success criteria

## References

- [Bigin API Documentation](https://www.bigin.com/developer/docs/apis/v2/)
- [Bigin OAuth Scopes](https://www.bigin.com/developer/docs/apis/scopes.html)
- [Bigin Modules API](https://www.bigin.com/developer/docs/apis/modules-api.html)
- [Bigin Get Records API](https://www.bigin.com/developer/docs/apis/get-records.html)
- [n8n Node Development Guide](https://docs.n8n.io/integrations/creating-nodes/)
- [CLAUDE.md - Development Guide](../../CLAUDE.md)
- [ADDING_NEW_ZOHO_APPS.md](../../ADDING_NEW_ZOHO_APPS.md)

## Notes

- Bigin API uses `v2` as the recommended version (v1 is legacy)
- Contact field names use Pascal_Case (e.g., `First_Name`, not `first_name`)
- The `data` array wrapper is required for create/update operations
- Maximum 200 records per page for list operations
- Search uses COQL syntax for criteria (e.g., "(Email:equals:test@example.com)")
- All timestamps are in ISO 8601 format with timezone
- Custom fields are prefixed with `cf_` in API responses

---

**Last Updated**: 2025-11-14
**Status**: Implementation Ready
**Branch**: `claude/zoho-bigin-phase-1-01SDwNg4VnzuAZ9khgwdvUr5`
**Phase**: 1 - Core Infrastructure
