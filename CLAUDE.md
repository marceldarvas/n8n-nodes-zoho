# CLAUDE.md - AI Assistant Development Guide

> Comprehensive guide for AI assistants working on the n8n-nodes-zoho codebase

## Project Overview

**n8n-nodes-zoho** is a custom node package for n8n (workflow automation platform) that provides comprehensive integration with multiple Zoho APIs including Sheets, Tasks, Billing (Subscriptions), Email, and Bigin CRM services.

- **Language**: TypeScript
- **Platform**: n8n workflow automation
- **License**: GPL-3.0
- **Package**: n8n-nodes-zoho
- **Version**: 1.0.2

### Key Features
- OAuth2 authentication with automatic token refresh
- Multi-regional support (US, EU, IN, AU, CN)
- Five specialized nodes: ZohoSheets, ZohoTasks, ZohoBilling, ZohoEmail, ZohoBigin
- Type-safe implementation with n8n-workflow integration

## Directory Structure

```
n8n-nodes-zoho/
├── credentials/                 # OAuth2 credential definitions
│   └── ZohoApi.credentials.ts  # Zoho API OAuth2 configuration
├── nodes/                       # Node implementations (TypeScript source)
│   ├── ZohoBilling.node.ts     # Billing/Subscriptions operations
│   ├── ZohoEmail.node.ts       # Email sending and scheduling
│   ├── ZohoSheets.node.ts      # Spreadsheet management
│   ├── ZohoTasks.node.ts       # Task and project management
│   ├── GenericFunctions.ts     # Shared API request utilities
│   ├── types.ts                # TypeScript type definitions
│   └── zoho.svg                # Node icon (copied to dist/)
├── docs/                        # API documentation
│   ├── Email.md                # Email API reference
│   ├── Tasks.md                # Tasks API reference
│   └── Zoho Subscriptions API.postman_collection.json
├── dist/                        # Compiled JavaScript output (gitignored)
│   ├── credentials/            # Compiled credential files
│   └── nodes/                  # Compiled node files
├── package.json                # NPM package configuration
├── tsconfig.json               # TypeScript compiler configuration
├── tslint.json                 # TSLint rules
├── gulpfile.js                 # Build tasks (copies SVG icons)
├── index.js                    # Package entry point (empty)
└── README.md                   # User-facing documentation
```

## Technology Stack

### Core Dependencies
- **n8n-workflow**: ^1.82.0 (devDependency) - n8n workflow types and utilities
- **TypeScript**: ^5.8.3 - Type safety and compilation
- **Gulp**: ^5.0.0 - Build task automation (icon copying)

### Development Tools
- **TSLint**: Code linting with strict rules
- **Jest**: ^29.7.0 - Testing framework
- **ts-jest**: ^29.3.2 - TypeScript support for Jest

### TypeScript Configuration
- **Target**: ES2019
- **Module**: CommonJS
- **Strict Mode**: Enabled (noImplicitAny, strictNullChecks, etc.)
- **Output**: `dist/` directory with source maps and declarations

## Development Workflows

### Build Process

```bash
# Development with auto-rebuild on file changes
npm run dev        # or npm run watch

# Production build (TypeScript compilation + Gulp tasks)
npm run build      # Runs: tsc && gulp

# Linting
npm run tslint

# Testing
npm test

# Release (build + publish)
npm run release
```

### Build Steps Explained
1. **TypeScript Compilation** (`tsc`): Compiles `.ts` files from `credentials/` and `nodes/` to `dist/`
2. **Gulp Task** (`gulp`): Copies SVG icons from `nodes/**/*.svg` to `dist/nodes/`
3. **Output**: Compiled `.js` files, `.d.ts` declarations, and `.js.map` source maps in `dist/`

### File Watching
During development, use `npm run watch` to automatically recompile TypeScript files on save. After compilation, restart n8n to test changes.

## Code Conventions & Patterns

### n8n Node Structure

Every n8n node follows this pattern:

```typescript
import {
    type IExecuteFunctions,
    type INodeType,
    type INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

export class NodeName implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Display Name',
        name: 'nodeName',              // camelCase, used in package.json
        icon: 'file:zoho.svg',         // Icon file
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Node description',
        defaults: { name: 'Node Name' },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: [{ name: 'zohoApi', required: true }],
        properties: [/* Parameter definitions */],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // Implementation
    }
}
```

### Parameter Definition Patterns

#### Resource/Operation Selection
```typescript
{
    displayName: 'Resource',
    name: 'resource',
    type: 'options',
    noDataExpression: true,
    options: [
        { name: 'Product', value: 'product', description: 'Operations on products' },
        { name: 'Customer', value: 'customer', description: 'Operations on customers' },
    ],
    default: 'product',
}
```

#### Conditional Parameters (displayOptions)
```typescript
{
    displayName: 'Customer ID',
    name: 'customerId',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['customer'],
            operation: ['getCustomer', 'updateCustomer'],
        },
    },
    description: 'ID of the customer',
}
```

#### fixedCollection for Filters
**Important Pattern**: When implementing filters, use `fixedCollection` with `multipleValues: true`:

```typescript
{
    displayName: 'Filters',
    name: 'filters',
    type: 'fixedCollection',
    default: { filter: [] },
    typeOptions: { multipleValues: true },
    placeholder: 'Add Filter',
    displayOptions: {
        show: {
            resource: ['customer'],
            operation: ['listCustomers'],
        },
    },
    options: [
        {
            displayName: 'Filter',
            name: 'filter',
            values: [
                {
                    displayName: 'Field Name',
                    name: 'filterBy',
                    type: 'options',
                    options: [
                        { name: 'Email Contains', value: 'email_contains' },
                        { name: 'Contact Number Contains', value: 'contact_number_contains' },
                        { name: 'Custom Field', value: 'custom_field' },
                    ],
                    default: 'email_contains',
                },
                {
                    displayName: 'Value',
                    name: 'filterValue',
                    type: 'string',
                    default: '',
                    description: 'Value to filter by',
                },
            ],
        },
    ],
}
```

#### Status Filters with multipleValueSlim
For status selection, use `multipleValueSlim` to allow multiple status values:

```typescript
{
    displayName: 'Status Filter',
    name: 'statusFilter',
    type: 'fixedCollection',
    default: { status: [] },
    placeholder: 'Add Status',
    displayOptions: {
        show: {
            resource: ['customer'],
            operation: ['listCustomers'],
        },
    },
    options: [
        {
            displayName: 'Status',
            name: 'status',
            values: [
                {
                    displayName: 'Status',
                    name: 'status',
                    type: 'multipleValueSlim',
                    default: [],
                    options: [
                        { name: 'Active', value: 'Status.Active' },
                        { name: 'Inactive', value: 'Status.Inactive' },
                    ],
                },
            ],
        },
    ],
}
```

### API Request Patterns

#### Generic Zoho API Request
```typescript
import { zohoApiRequest } from './GenericFunctions';

const responseData = await zohoApiRequest.call(
    this,
    'GET',                          // HTTP method
    'https://base.url',             // Base URL
    '/api/endpoint',                // URI path
    { key: 'value' },              // Request body (optional)
    { param: 'value' }             // Query string (optional)
);
```

#### Zoho Subscriptions API Request
```typescript
import { zohoSubscriptionsApiRequest } from './GenericFunctions';

const responseData = await zohoSubscriptionsApiRequest.call(
    this,
    'POST',                         // HTTP method
    'https://www.zohoapis.eu/billing/v1/customers',  // Full URI
    { customer_name: 'John' },     // Request body
    { page: 1 },                   // Query string
    organizationId                  // Organization ID (required header)
);
```

### Execute Method Pattern

```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const baseURL = 'https://www.zohoapis.eu/billing/v1';
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    for (let i = 0; i < items.length; i++) {
        const operation = this.getNodeParameter('operation', i) as string;
        const orgId = this.getNodeParameter('organizationId', i) as string;

        if (operation === 'listProducts') {
            const responseData = await zohoSubscriptionsApiRequest.call(
                this, 'GET', `${baseURL}/products`, {}, {}, orgId
            );
            returnData.push({ json: responseData as IDataObject });
        }
        // ... more operations
    }

    return [this.helpers.returnJsonArray(returnData)];
}
```

### Filter Processing Pattern

When processing filters from fixedCollection:

```typescript
const filters = this.getNodeParameter('filters', i, { filter: [] }) as {
    filter: Array<{ filterBy: string; filterValue: string; customFieldId?: string }>;
};

const queryParams: IDataObject = {};

if (filters.filter && filters.filter.length > 0) {
    filters.filter.forEach((filter) => {
        if (filter.filterBy === 'custom_field' && filter.customFieldId) {
            queryParams[`cf_${filter.customFieldId}`] = filter.filterValue;
        } else {
            queryParams[filter.filterBy] = filter.filterValue;
        }
    });
}
```

### Status Filter Processing

```typescript
const statusFilter = this.getNodeParameter('statusFilter', i, { status: [] }) as {
    status: Array<{ status: string[] }>;
};

if (statusFilter.status && statusFilter.status.length > 0) {
    const statuses = statusFilter.status[0]?.status || [];
    if (statuses.length > 0) {
        queryParams.status = statuses.join(',');
    }
}
```

## TypeScript & Linting Rules

### Key TSLint Rules
- **No `any` types**: Always use explicit types or `IDataObject`
- **Single quotes**: Use single quotes for strings
- **Semicolons**: Always required
- **Strict null checks**: Enabled
- **No default exports**: Use named exports only
- **Arrow functions**: Prefer arrow functions over function declarations
- **Const over let**: Use `const` when possible

### Type Imports
Always use `type` imports for type-only imports:

```typescript
import type { IExecuteFunctions, IDataObject } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';  // Runtime import
```

### Error Handling
```typescript
import { NodeOperationError, NodeApiError } from 'n8n-workflow';

// For user input errors
throw new NodeOperationError(this.getNode(), 'Error message');

// For API errors
throw new NodeApiError(this.getNode(), error as JsonObject, {
    message: 'API error message',
    description: JSON.stringify(errorData, null, 2),
});
```

## OAuth2 Authentication

### Credential Structure
Located in `credentials/ZohoApi.credentials.ts`:

- Extends `oAuth2Api`
- Supports multiple regional endpoints
- Default scopes include: CRM, Subscriptions, Sheets, Mail, Tasks, WorkDrive
- Uses `access_type=offline` for refresh tokens

### Token Management
`GenericFunctions.ts` handles token refresh automatically:

```typescript
async function getAccessTokenData(/* ... */) {
    // Retrieves credentials
    // Checks token expiration
    // Refreshes if needed
    // Returns access_token, api_domain, etc.
}
```

All API functions call `getAccessTokenData()` before making requests.

## Dynamic Load Options & Field Metadata

### Overview

The Zoho Bigin node includes a **generalized field metadata system** that dynamically loads picklist options from Bigin's Settings API. This enables:
- Dynamic dropdowns for standard fields (Lead_Source, Industry, Priority, etc.)
- Custom field picklists (cf_custom_field_id)
- Multi-select picklists
- Localized display values (automatic language support)
- 1-hour caching to minimize API calls

### Required OAuth Scopes

To access field metadata, ensure the following scope is included in `credentials/ZohoApi.credentials.ts`:
```
ZohoBigin.settings.fields.READ
```
or
```
ZohoBigin.settings.ALL
```

### Static Helper Method: `fetchFieldPicklistOptions`

Located in `ZohoBigin.node.ts`, this **static helper method** fetches picklist values for any field in any module:

```typescript
private static async fetchFieldPicklistOptions(
    context: ILoadOptionsFunctions,
    moduleName: string,
    fieldApiName: string,
): Promise<INodePropertyOptions[]> {
    // Fetches field metadata from /settings/fields?module={moduleName}
    // Finds field by fieldApiName
    // Extracts picklist values
    // Caches for 1 hour
    // Returns array of { name, value } options
}
```

**Features:**
- Caches results for 1 hour using `metadataCache`
- Prioritizes `display_value` over `actual_value` for localization
- Returns empty array if field not found (graceful degradation)
- Logs errors without crashing

### Adding Dynamic Dropdowns to Parameters

#### Step 1: Create a Load Options Method

In `ZohoBigin.node.ts`, add a method in the `methods.loadOptions` section:

```typescript
/**
 * Load Lead Source options for Contacts
 * Usage: loadOptionsMethod: 'getContactLeadSourceOptions'
 */
async getContactLeadSourceOptions(
    this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
    return await ZohoBigin.fetchFieldPicklistOptions(this, 'Contacts', 'Lead_Source');
},
```

#### Step 2: Use in Parameter Definition

In your description file (e.g., `BiginContactsDescription.ts`):

```typescript
{
    displayName: 'Lead Source',
    name: 'Lead_Source',
    type: 'options',
    typeOptions: {
        loadOptionsMethod: 'getContactLeadSourceOptions',
    },
    default: '',
    description: 'Source of the lead (values loaded from Bigin)',
},
```

### Common Use Cases

#### Custom Fields

For custom fields with picklist type:

```typescript
async getContactPizzaToppingOptions(
    this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
    return await ZohoBigin.fetchFieldPicklistOptions(this, 'Contacts', 'cf_pizza_topping');
},
```

#### Multi-Module Fields

Different modules can have different options for the same field name:

```typescript
// Contacts Industry
async getContactIndustryOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return await ZohoBigin.fetchFieldPicklistOptions(this, 'Contacts', 'Industry');
}

// Accounts Industry (different values)
async getAccountIndustryOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
    return await ZohoBigin.fetchFieldPicklistOptions(this, 'Accounts', 'Industry');
}
```

### Supported Modules

The field metadata system works with all Bigin modules:
- **Contacts** (`module=Contacts`)
- **Accounts** (`module=Accounts`)
- **Pipelines/Deals** (`module=Deals`)
- **Products** (`module=Products`)
- **Tasks** (`module=Tasks`)
- **Events** (`module=Events`)
- **Notes** (`module=Notes`)

### Cache Management

**Cache Key Format**: `fields:{ModuleName}:{FieldApiName}`
**Example**: `fields:Contacts:Lead_Source`

**Cache Duration**: 1 hour (3600000 milliseconds)

**Cache Structure**:
```typescript
{
    data: { options: INodePropertyOptions[] },
    expiry: number // timestamp
}
```

To clear cache (manual process):
```typescript
ZohoBigin.metadataCache.delete('fields:Contacts:Lead_Source');
```

### Localization

The system automatically supports multiple languages:
- **English**: "Not Applicable", "Legitimate Interests", "Contract"
- **Hungarian**: "Nem alkalmazható", "Jogos érdek", "Szerződés"
- **German**: "Nicht anwendbar", "Berechtigte Interessen", "Vertrag"
- **French**: "Non applicable", "Intérêts légitimes", "Contrat"

Values are determined by the Bigin account's language setting and fetched from `pick_list_values[].display_value`.

### GDPR Example (Real Implementation)

The GDPR Data Processing Basis field demonstrates this pattern:

```typescript
async getDataProcessingBasisOptions(
    this: ILoadOptionsFunctions,
): Promise<INodePropertyOptions[]> {
    const options = await ZohoBigin.fetchFieldPicklistOptions(this, 'Contacts', 'Data_Processing_Basis');

    // Fallback if field not found
    if (options.length === 0) {
        return [
            { name: 'Not Applicable', value: 'Not Applicable' },
            { name: 'Legitimate Interests', value: 'Legitimate Interests' },
            // ... default values
        ];
    }

    return options;
}
```

### Debugging

**Check if field exists:**
```
GET /bigin/v2/settings/fields?module=Contacts
```

**Find field API name:**
```json
{
  "fields": [
    {
      "api_name": "Lead_Source",
      "field_label": "Lead Source",
      "pick_list_values": [
        { "actual_value": "Web", "display_value": "Web" },
        { "actual_value": "Phone", "display_value": "Phone" }
      ]
    }
  ]
}
```

**Test load options:**
1. Use n8n's parameter testing feature
2. Check browser console for errors
3. Verify OAuth scope includes `ZohoBigin.settings.fields.READ`
4. Confirm field API name matches exactly (case-sensitive)

### Performance Considerations

- **First Load**: ~200ms (API call + parsing)
- **Cached Load**: <1ms
- **Cache Expiry**: 1 hour (configurable)
- **Multiple Fields**: Cached independently per module/field combination

### Best Practices

1. **Descriptive Method Names**: Use format `get{Module}{Field}Options` (e.g., `getContactLeadSourceOptions`)
2. **Document Usage**: Add JSDoc comments with `loadOptionsMethod` reference
3. **Graceful Fallbacks**: Return empty array or default options if API fails
4. **Module API Names**: Use correct module names (Deals, not Pipelines for API)
5. **Field API Names**: Use exact case-sensitive field names (e.g., `Lead_Source` not `lead_source`)

## Testing

### Jest Configuration
- Test files: `**/*.test.ts` or `**/*.spec.ts`
- Transform: ts-jest for TypeScript
- Ignored: `dist/`, `node_modules/`

### Running Tests
```bash
npm test
```

Currently, test infrastructure is in place but specific test files need to be created.

## Common Development Tasks

### Adding a New Operation

1. **Add operation to properties array**:
```typescript
{
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    displayOptions: { show: { resource: ['customer'] } },
    options: [
        // ... existing options
        { name: 'New Operation', value: 'newOperation', description: 'Description' },
    ],
}
```

2. **Add required parameters** with appropriate `displayOptions`

3. **Implement in execute method**:
```typescript
} else if (operation === 'newOperation') {
    const param = this.getNodeParameter('paramName', i) as string;
    const responseData = await zohoSubscriptionsApiRequest.call(
        this, 'POST', `${baseURL}/endpoint`, { data }, {}, orgId
    );
    returnData.push({ json: responseData as IDataObject });
}
```

### Adding a New Filter

1. **Add filter option** in the `filters` fixedCollection
2. **Process in execute method** as shown in Filter Processing Pattern above
3. **Test** with actual API calls

### Debugging Tips

- **Console logs**: Use `console.log()` (visible in n8n logs)
- **Check API responses**: Log `responseData` to inspect structure
- **Validate JSON**: When using `jsonData` parameters, always wrap `JSON.parse()` in try-catch
- **Parameter types**: Use correct type assertions when calling `getNodeParameter()`

## Git Workflow

### Branch Naming
- Feature branches: `claude/claude-md-{session-id}-{unique-id}`
- All development on designated branches only

### Commit Guidelines
- Clear, descriptive messages
- Reference issue numbers when applicable
- Example: `fix(ZohoBilling): support Status.Active/Status.Inactive in Filters`
- Use prefixes: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

### Git Operations
```bash
# Ensure you're on the correct branch
git status

# Build before committing
npm run build

# Stage and commit changes
git add .
git commit -m "descriptive message"

# Push to designated branch
git push -u origin claude/claude-md-{session-id}

# NEVER push to main/master without explicit permission
```

## Package.json Configuration

### n8n Integration Section
```json
"n8n": {
  "credentials": [
    "dist/credentials/ZohoApi.credentials.js"
  ],
  "nodes": [
    "dist/nodes/Zoho/ZohoSheets.node.js",
    "dist/nodes/Zoho/ZohoBilling.node.js",
    "dist/nodes/Zoho/ZohoTasks.node.js",
    "dist/nodes/Zoho/ZohoEmail.node.js"
  ]
}
```

Note: Paths reference compiled `.js` files in `dist/`, not source `.ts` files.

## Important Files Reference

| File | Purpose | When to Edit |
|------|---------|--------------|
| `nodes/ZohoBilling.node.ts` | Billing/Subscriptions node | Adding billing operations, filters |
| `nodes/ZohoEmail.node.ts` | Email node | Email-related features |
| `nodes/ZohoSheets.node.ts` | Sheets node | Spreadsheet operations |
| `nodes/ZohoTasks.node.ts` | Tasks node | Task management features |
| `nodes/ZohoBigin.node.ts` | Bigin CRM node | Adding CRM operations, resources |
| `nodes/descriptions/BiginPipelinesDescription.ts` | Bigin Pipelines parameters | Pipeline/Deal operations |
| `nodes/descriptions/BiginContactsDescription.ts` | Bigin Contacts parameters | Contact operations |
| `nodes/descriptions/BiginAccountsDescription.ts` | Bigin Accounts parameters | Account operations |
| `nodes/descriptions/BiginProductsDescription.ts` | Bigin Products parameters | Product operations |
| `nodes/descriptions/BiginTasksDescription.ts` | Bigin Tasks parameters | Task operations |
| `nodes/descriptions/BiginEventsDescription.ts` | Bigin Events parameters | Event operations |
| `nodes/descriptions/BiginNotesDescription.ts` | Bigin Notes parameters | Note operations |
| `nodes/GenericFunctions.ts` | Shared API utilities | Modifying API request logic |
| `nodes/types.ts` | TypeScript types | Adding new type definitions |
| `credentials/ZohoApi.credentials.ts` | OAuth2 config | Changing auth flow, scopes, endpoints |
| `package.json` | Package metadata | Dependencies, scripts, n8n paths |
| `tsconfig.json` | TypeScript config | Compiler options |
| `tslint.json` | Linting rules | Code style enforcement |
| `gulpfile.js` | Build tasks | Adding build steps |

## API Documentation Reference

- **Email API**: `docs/Email.md`
- **Tasks API**: `docs/Tasks.md`
- **Bigin API**: `docs/Bigin.md`
- **Bigin Usage Examples**: `docs/BIGIN_EXAMPLES.md`
- **Postman Collection**: `docs/Zoho Subscriptions API.postman_collection.json`

## Troubleshooting

### Build Issues
- **Compilation errors**: Check `tsconfig.json` and ensure all types are properly imported
- **Missing types**: Install `@types/*` packages or define in `types.ts`
- **Icon not appearing**: Ensure `gulpfile.js` ran successfully and SVG is in `dist/nodes/`

### Runtime Issues
- **Credential errors**: Verify OAuth2 flow, check token refresh logic in `GenericFunctions.ts`
- **API errors**: Log request options and response data
- **Parameter not showing**: Check `displayOptions` conditions
- **Type errors**: Use proper type assertions and avoid `any`

### Common Mistakes to Avoid
1. **Forgetting to build**: Always run `npm run build` before testing in n8n
2. **Wrong parameter types**: Use correct type assertion: `as string`, `as IDataObject`, etc.
3. **Missing displayOptions**: Parameters won't show without proper conditions
4. **Hardcoded URLs**: Use variables for base URLs to support multi-region
5. **Not handling errors**: Always wrap API calls in try-catch or use n8n error handlers
6. **Modifying dist/**: Never edit files in `dist/` directly - they're auto-generated

## Best Practices

### Code Organization
- Keep operations grouped by resource type
- Use helper functions for repeated logic
- Extract complex parameter processing to separate functions
- Maintain consistent naming conventions

### Parameter Design
- Provide clear descriptions for all parameters
- Use appropriate input types (string, number, options, etc.)
- Add validation where necessary
- Use `noDataExpression: true` for static options

### Error Messages
- Be specific about what went wrong
- Include relevant context (IDs, parameters)
- Suggest solutions when possible
- Use `NodeOperationError` for user errors, `NodeApiError` for API failures

### Documentation
- Update README.md when adding features
- Add examples for complex operations
- Document API quirks in code comments
- Keep docs/ directory updated

## Zoho Bigin Node

Located in `nodes/ZohoBigin.node.ts`

### Architecture

The Bigin node is a comprehensive CRM integration designed for small businesses, implementing 7 core resources with full CRUD operations.

- **Base URL**: Regional, determined by OAuth credentials via `getBiginBaseUrl()`
- **Authentication**: OAuth2 with Bigin-specific scopes (`ZohoBigin.modules.ALL`)
- **API Version**: v1
- **Modules**: 7 resources (Pipelines, Contacts, Accounts, Products, Tasks, Events, Notes)

### Key Files

- `nodes/ZohoBigin.node.ts` - Main node implementation with execute method
- `nodes/descriptions/Bigin*.ts` - Parameter descriptions for each resource
- `nodes/GenericFunctions.ts` - Contains `zohoBiginApiRequest()` and `getBiginBaseUrl()`

### Resources Implementation

#### 1. Pipelines (Deals)
**Handler**: `handlePipelinesOperations()`
**Operations**: List, Get, Create, Update, Delete, Search
**API Module**: `Deals`
**Special Features**:
- COQL-based search for advanced filtering
- Stage management
- Amount and closing date tracking
- Lookup relationships to Contacts and Accounts

#### 2. Contacts
**Handler**: `handleContactsOperations()`
**Operations**: List, Get, Create, Update, Delete, Search, Bulk Create, Bulk Update
**API Module**: `Contacts`
**Special Features**:
- Bulk operations (up to 100 records)
- Email and phone validation
- Company lookup relationships

#### 3. Accounts (Companies)
**Handler**: `handleAccountsOperations()`
**Operations**: List, Get, Create, Update, Delete, Search
**API Module**: `Accounts`
**Special Features**:
- Website URL tracking
- Industry and revenue fields
- Parent-child account relationships

#### 4. Products
**Handler**: `handleProductsOperations()`
**Operations**: List, Get, Create, Update, Delete
**API Module**: `Products`
**Special Features**:
- Pricing management
- Stock quantity tracking
- Product categories

#### 5. Tasks
**Handler**: `handleTasksOperations()`
**Operations**: List, Get, Create, Update, Delete
**API Module**: `Tasks`
**Special Features**:
- Priority and status management
- Due date tracking
- Related_To lookup (link to Pipelines, Contacts, Accounts)

#### 6. Events
**Handler**: `handleEventsOperations()`
**Operations**: List, Get, Create, Update, Delete
**API Module**: `Events`
**Special Features**:
- DateTime handling (ISO 8601 format)
- Participant management
- Location and reminder fields

#### 7. Notes
**Handler**: `handleNotesOperations()`
**Operations**: List, Get, Create, Update, Delete
**API Module**: `Notes`
**Special Features**:
- Parent_Id lookup (attach to any module)
- Rich text content support

### Adding New Operations

1. **Add operation to appropriate description file** (e.g., `BiginPipelinesDescription.ts`)
2. **Add handler logic** in corresponding `handle{Resource}Operations()` method in `ZohoBigin.node.ts`
3. **Use `zohoBiginApiRequest()`** for API calls:
   ```typescript
   const response = await zohoBiginApiRequest.call(
       this,
       'GET',                              // HTTP method
       `/Deals/${pipelineId}`,            // Endpoint
       {},                                 // Request body
       {}                                  // Query params
   );
   ```
4. **Test with actual API** using n8n instance
5. **Update documentation** in `docs/Bigin.md` and `docs/BIGIN_EXAMPLES.md`

### API Quirks and Best Practices

#### Field Naming Convention
- Bigin uses **underscore format**: `First_Name`, `Last_Name`, `Deal_Name`
- Not camelCase: ❌ `firstName` ✅ `First_Name`

#### Lookup Fields
- Use object format with ID: `{"id": "4876876000000123456"}`
- Example: `"Contact_Name": {"id": "4876876000000123456"}`

#### Response Structure
- All responses wrapped in `data` array: `response.data`
- Success responses: `{data: [{details: {...}, status: "success"}]}`
- Error responses: `{data: [{code: "ERROR_CODE", message: "...", status: "error"}]}`

#### COQL Queries
- Use module API name (e.g., `Deals` not `Pipelines`)
- Format: `"select Field1, Field2 from Module where Condition order by Field"`
- Date format: ISO 8601 (`2024-01-15T00:00:00-05:00`)
- String matching: `like '%value%'`

#### Bulk Operations
- Maximum 100 records per bulk create/update
- Array format: `[{record1}, {record2}, ...]`
- Each record must include `id` field for updates

#### Regional Base URLs
Determined automatically by `getBiginBaseUrl()`:
- US: `https://www.zohoapis.com/bigin/v1`
- EU: `https://www.zohoapis.eu/bigin/v1`
- AU: `https://www.zohoapis.com.au/bigin/v1`
- IN: `https://www.zohoapis.in/bigin/v1`
- CN: `https://www.zohoapis.com.cn/bigin/v1`

### Code Organization Pattern

The Bigin node follows a modular pattern:

```typescript
// Main execute method
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: IDataObject[] = [];

    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter('resource', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        // Route to appropriate handler
        let responseData: IDataObject;
        if (resource === 'pipelines') {
            responseData = await this.handlePipelinesOperations(operation, i);
        } else if (resource === 'contacts') {
            responseData = await this.handleContactsOperations(operation, i);
        }
        // ... more resources

        returnData.push(responseData);
    }

    return [this.helpers.returnJsonArray(returnData)];
}

// Resource-specific handler
async handlePipelinesOperations(operation: string, itemIndex: number): Promise<IDataObject> {
    if (operation === 'create') {
        const jsonData = this.getNodeParameter('jsonData', itemIndex) as string;
        const body = JSON.parse(jsonData);
        return await zohoBiginApiRequest.call(this, 'POST', '/Deals', {data: [body]}, {});
    }
    // ... more operations
}
```

### Testing Considerations

#### Unit Tests
- Test `getBiginBaseUrl()` for all regions ✅ (see `GenericFunctions.test.ts`)
- Mock API responses for handler methods
- Validate JSON parsing and error handling

#### Integration Tests
- Use actual Bigin sandbox account
- Test CRUD operations for each resource
- Verify COQL search functionality
- Test bulk operations with varying batch sizes

#### Common Test Scenarios
1. Create record → Verify in Bigin → Delete
2. Search with COQL → Validate results
3. Bulk create 100 records → Check success
4. Update with lookup field → Verify relationship
5. Invalid ID → Expect proper error message

### Known Limitations

1. **No Mass Delete**: Bigin API doesn't support bulk delete (must loop)
2. **COQL Limitations**: No aggregation functions (SUM, COUNT, etc.)
3. **Rate Limits**: Subject to Zoho API rate limits (implement delays for bulk ops)
4. **Custom Fields**: Require field ID lookup (format: `cf_{field_id}`)
5. **File Attachments**: Not currently supported in this implementation

### Development Checklist for New Features

- [ ] Add operation to description file
- [ ] Implement handler logic with proper error handling
- [ ] Use correct API endpoint and method
- [ ] Handle JSON parsing with try-catch
- [ ] Add displayOptions for conditional parameters
- [ ] Test with actual Bigin account
- [ ] Update `docs/Bigin.md` API reference
- [ ] Add examples to `docs/BIGIN_EXAMPLES.md`
- [ ] Add unit tests if new helper functions created
- [ ] Run `npm run build` and verify compilation
- [ ] Test in n8n workflow

## Recent Changes & Context

### Zoho Bigin Integration (Phase 1-5 Complete)
Full implementation of Zoho Bigin CRM node with comprehensive documentation:
- **7 Resources**: Pipelines, Contacts, Accounts, Products, Tasks, Events, Notes
- **Full CRUD**: All resources support Create, Read, Update, Delete operations
- **Advanced Features**: COQL search, bulk operations, lookup relationships
- **Multi-regional**: Automatic base URL detection via `getBiginBaseUrl()`
- **Type-safe**: Full TypeScript implementation with proper error handling
- **Documentation**: Complete API docs (`docs/Bigin.md`) and usage examples (`docs/BIGIN_EXAMPLES.md`)
- **Testing**: Unit tests for core functions, integration-ready structure

### Customer Status Filter Implementation
Recent commits have focused on integrating status filtering for customers:
- Status values: `Status.Active`, `Status.Inactive`
- Implemented as separate `fixedCollection` with `multipleValueSlim` type
- Allows selecting multiple statuses at once
- Processed as comma-separated values in query parameters

### Filter Architecture
Filters and status are kept in separate `fixedCollection` parameters:
- **filters**: For search, contains, custom field filters
- **statusFilter**: For status selection (Active/Inactive)

This separation provides better UX and clearer parameter organization.

## Summary Checklist for AI Assistants

When working on this codebase:

- [ ] Run `npm run build` after making changes
- [ ] Follow TypeScript strict mode requirements
- [ ] Use proper n8n parameter patterns (displayOptions, fixedCollection, etc.)
- [ ] Handle errors with NodeOperationError or NodeApiError
- [ ] Test with actual n8n instance
- [ ] Update relevant documentation
- [ ] Follow git branch naming conventions
- [ ] Use TSLint-compliant code style
- [ ] Validate JSON inputs with try-catch
- [ ] Log meaningful debug information

---

**Last Updated**: 2025-11-13
**Maintained for**: Claude Code and AI development assistants
**Repository**: https://github.com/vladaman/n8n-nodes-zoho
