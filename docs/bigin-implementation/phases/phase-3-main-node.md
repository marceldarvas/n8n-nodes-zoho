# Phase 3: Main Node Implementation

> Create the ZohoBigin.node.ts file with execute logic for all operations

## 📋 Overview

Phase 3 involves creating the main node file that brings together all the description files from Phase 2 and implements the actual API call logic for each operation. This is the heart of the Bigin integration.

**Priority**: Critical
**Estimated Effort**: 8-12 hours
**Dependencies**: Phase 1 (Core Infrastructure), Phase 2 (Node Descriptions)
**Blocks**: Phase 4 (Package Configuration), Phase 5 (Testing)

## 🎯 Objectives

1. ✅ Create `nodes/ZohoBigin.node.ts` file
2. ✅ Implement node description with all resources
3. ✅ Implement execute method with resource routing
4. ✅ Add API call logic for all operations
5. ✅ Implement error handling and data transformation
6. ✅ Support all CRUD operations across 7 modules
7. ✅ Handle pagination, filtering, and sorting

## 📂 File Location

Create: `nodes/ZohoBigin.node.ts`

## 🏗️ Node Structure

### Basic Template

```typescript
import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

import { getBiginBaseUrl, zohoBiginApiRequest } from './GenericFunctions';

import {
    // Pipelines
    pipelinesOperations,
    pipelinesFields,
    // Contacts
    contactsOperations,
    contactsFields,
    // Accounts
    accountsOperations,
    accountsFields,
    // Products
    productsOperations,
    productsFields,
    // Tasks
    tasksOperations,
    tasksFields,
    // Events
    eventsOperations,
    eventsFields,
    // Notes
    notesOperations,
    notesFields,
} from './descriptions';

export class ZohoBigin implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Bigin',
        name: 'zohoBigin',
        icon: 'file:zoho.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
        description: 'Consume Zoho Bigin CRM API',
        defaults: {
            name: 'Zoho Bigin',
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
            // Resource selector
            {
                displayName: 'Resource',
                name: 'resource',
                type: 'options',
                noDataExpression: true,
                options: [
                    {
                        name: 'Pipeline',
                        value: 'pipeline',
                        description: 'Operations on pipeline records (deals)',
                    },
                    {
                        name: 'Contact',
                        value: 'contact',
                        description: 'Operations on contacts',
                    },
                    {
                        name: 'Account',
                        value: 'account',
                        description: 'Operations on companies/accounts',
                    },
                    {
                        name: 'Product',
                        value: 'product',
                        description: 'Operations on products',
                    },
                    {
                        name: 'Task',
                        value: 'task',
                        description: 'Operations on tasks',
                    },
                    {
                        name: 'Event',
                        value: 'event',
                        description: 'Operations on calendar events',
                    },
                    {
                        name: 'Note',
                        value: 'note',
                        description: 'Operations on notes',
                    },
                ],
                default: 'pipeline',
            },
            // Operations and fields
            ...pipelinesOperations,
            ...contactsOperations,
            ...accountsOperations,
            ...productsOperations,
            ...tasksOperations,
            ...eventsOperations,
            ...notesOperations,
            ...pipelinesFields,
            ...contactsFields,
            ...accountsFields,
            ...productsFields,
            ...tasksFields,
            ...eventsFields,
            ...notesFields,
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        const credentials = await this.getCredentials('zohoApi');
        const baseUrl = getBiginBaseUrl(credentials.accessTokenUrl as string);

        for (let i = 0; i < items.length; i++) {
            try {
                const resource = this.getNodeParameter('resource', i) as string;
                const operation = this.getNodeParameter('operation', i) as string;

                let responseData: IDataObject | IDataObject[] = {};

                // Route to appropriate handler
                if (resource === 'pipeline') {
                    responseData = await this.handlePipelineOperations(operation, i, baseUrl);
                } else if (resource === 'contact') {
                    responseData = await this.handleContactOperations(operation, i, baseUrl);
                } else if (resource === 'account') {
                    responseData = await this.handleAccountOperations(operation, i, baseUrl);
                } else if (resource === 'product') {
                    responseData = await this.handleProductOperations(operation, i, baseUrl);
                } else if (resource === 'task') {
                    responseData = await this.handleTaskOperations(operation, i, baseUrl);
                } else if (resource === 'event') {
                    responseData = await this.handleEventOperations(operation, i, baseUrl);
                } else if (resource === 'note') {
                    responseData = await this.handleNoteOperations(operation, i, baseUrl);
                }

                // Add response to return data
                if (Array.isArray(responseData)) {
                    returnData.push(...responseData.map(item => ({ json: item })));
                } else {
                    returnData.push({ json: responseData });
                }

            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: (error as Error).message,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }

    // Handler methods for each resource
    private async handlePipelineOperations(
        operation: string,
        itemIndex: number,
        baseUrl: string,
    ): Promise<IDataObject | IDataObject[]> {
        // Implementation
    }

    // ... other handler methods
}
```

---

## 🔄 Execute Method Pattern

### Standard Operation Flow

Each operation follows this pattern:

```typescript
if (operation === 'listPipelines') {
    // 1. Get parameters
    const page = this.getNodeParameter('page', itemIndex, 1) as number;
    const perPage = this.getNodeParameter('perPage', itemIndex, 200) as number;
    const filters = this.getNodeParameter('filters', itemIndex, { filter: [] }) as IDataObject;

    // 2. Build query parameters
    const queryParams: IDataObject = {
        page,
        per_page: perPage,
    };

    // 3. Process filters
    if (filters.filter && Array.isArray(filters.filter)) {
        filters.filter.forEach((filter: IDataObject) => {
            queryParams[filter.filterBy as string] = filter.filterValue;
        });
    }

    // 4. Make API request
    const response = await zohoBiginApiRequest.call(
        this,
        'GET',
        '/Pipelines',
        {},
        queryParams,
    );

    // 5. Return data
    return response.data || [];
}
```

---

## 📚 Implementation by Resource

### 1. Pipeline Operations Handler

```typescript
private async handlePipelineOperations(
    operation: string,
    itemIndex: number,
    baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
    if (operation === 'listPipelines') {
        const page = this.getNodeParameter('page', itemIndex, 1) as number;
        const perPage = this.getNodeParameter('perPage', itemIndex, 200) as number;
        const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;

        const qs: IDataObject = { page, per_page: perPage };

        // Process filters
        // ... filter logic

        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            '/Pipelines',
            {},
            qs,
        );

        return response.data || [];

    } else if (operation === 'getPipeline') {
        const pipelineId = this.getNodeParameter('pipelineId', itemIndex) as string;

        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            `/Pipelines/${pipelineId}`,
            {},
            {},
        );

        return response.data?.[0] || {};

    } else if (operation === 'createPipeline') {
        const dealName = this.getNodeParameter('dealName', itemIndex) as string;
        const stage = this.getNodeParameter('stage', itemIndex) as string;
        const amount = this.getNodeParameter('amount', itemIndex, 0) as number;
        const closeDate = this.getNodeParameter('closeDate', itemIndex, '') as string;
        const additionalFields = this.getNodeParameter('additionalFields', itemIndex, '{}') as string;

        let additionalData: IDataObject = {};
        try {
            additionalData = JSON.parse(additionalFields);
        } catch (error) {
            throw new NodeOperationError(
                this.getNode(),
                'Additional fields must be valid JSON',
            );
        }

        const body = {
            data: [
                {
                    Deal_Name: dealName,
                    Stage: stage,
                    Amount: amount,
                    Closing_Date: closeDate,
                    ...additionalData,
                },
            ],
        };

        const response = await zohoBiginApiRequest.call(
            this,
            'POST',
            '/Pipelines',
            body,
            {},
        );

        return response.data?.[0]?.details || {};

    } else if (operation === 'updatePipeline') {
        const pipelineId = this.getNodeParameter('pipelineId', itemIndex) as string;
        const updateFields = this.getNodeParameter('updateFields', itemIndex, '{}') as string;

        let updateData: IDataObject = {};
        try {
            updateData = JSON.parse(updateFields);
        } catch (error) {
            throw new NodeOperationError(
                this.getNode(),
                'Update fields must be valid JSON',
            );
        }

        const body = {
            data: [
                {
                    id: pipelineId,
                    ...updateData,
                },
            ],
        };

        const response = await zohoBiginApiRequest.call(
            this,
            'PUT',
            '/Pipelines',
            body,
            {},
        );

        return response.data?.[0]?.details || {};

    } else if (operation === 'deletePipeline') {
        const pipelineId = this.getNodeParameter('pipelineId', itemIndex) as string;

        const response = await zohoBiginApiRequest.call(
            this,
            'DELETE',
            `/Pipelines/${pipelineId}`,
            {},
            {},
        );

        return response.data?.[0]?.details || {};

    } else if (operation === 'searchPipelines') {
        const searchTerm = this.getNodeParameter('searchTerm', itemIndex) as string;
        const searchField = this.getNodeParameter('searchField', itemIndex, 'Deal_Name') as string;

        const qs: IDataObject = {
            criteria: `(${searchField}:contains:${searchTerm})`,
        };

        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            '/Pipelines/search',
            {},
            qs,
        );

        return response.data || [];
    }

    throw new NodeOperationError(
        this.getNode(),
        `Unknown operation: ${operation}`,
    );
}
```

**See**: [Pipelines module documentation](../modules/pipelines.md) for all field names and API details

---

### 2. Contact Operations Handler

```typescript
private async handleContactOperations(
    operation: string,
    itemIndex: number,
    baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
    if (operation === 'listContacts') {
        // Similar pattern to listPipelines
        const page = this.getNodeParameter('page', itemIndex, 1) as number;
        const perPage = this.getNodeParameter('perPage', itemIndex, 200) as number;

        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            '/Contacts',
            {},
            { page, per_page: perPage },
        );

        return response.data || [];

    } else if (operation === 'getContact') {
        const contactId = this.getNodeParameter('contactId', itemIndex) as string;

        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            `/Contacts/${contactId}`,
            {},
            {},
        );

        return response.data?.[0] || {};

    } else if (operation === 'createContact') {
        const firstName = this.getNodeParameter('firstName', itemIndex, '') as string;
        const lastName = this.getNodeParameter('lastName', itemIndex) as string;
        const email = this.getNodeParameter('email', itemIndex, '') as string;
        const phone = this.getNodeParameter('phone', itemIndex, '') as string;
        const mobile = this.getNodeParameter('mobile', itemIndex, '') as string;
        const accountId = this.getNodeParameter('accountId', itemIndex, '') as string;

        const body = {
            data: [
                {
                    First_Name: firstName,
                    Last_Name: lastName,
                    Email: email,
                    Phone: phone,
                    Mobile: mobile,
                    ...(accountId && { Account_Name: { id: accountId } }),
                },
            ],
        };

        const response = await zohoBiginApiRequest.call(
            this,
            'POST',
            '/Contacts',
            body,
            {},
        );

        return response.data?.[0]?.details || {};

    } else if (operation === 'updateContact') {
        // Similar to updatePipeline
    } else if (operation === 'deleteContact') {
        // Similar to deletePipeline
    } else if (operation === 'searchContacts') {
        // Similar to searchPipelines but for Contacts module
    }

    throw new NodeOperationError(
        this.getNode(),
        `Unknown operation: ${operation}`,
    );
}
```

**See**: [Contacts module documentation](../modules/contacts.md)

---

### 3. Account Operations Handler

```typescript
private async handleAccountOperations(
    operation: string,
    itemIndex: number,
    baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
    // Similar pattern to contacts
    // Module name in API: 'Accounts'
    // Key field: Account_Name
}
```

**See**: [Accounts module documentation](../modules/accounts.md)

---

### 4-7. Remaining Handlers

Follow the same pattern for:
- `handleProductOperations()` - [Products documentation](../modules/products.md)
- `handleTaskOperations()` - [Tasks documentation](../modules/tasks.md)
- `handleEventOperations()` - [Events documentation](../modules/events.md)
- `handleNoteOperations()` - [Notes documentation](../modules/notes.md)

---

## 🛠️ Helper Utilities

### Filter Processing

Create a helper method for processing filters:

```typescript
private processFilters(filters: IDataObject): IDataObject {
    const queryParams: IDataObject = {};

    if (filters.filter && Array.isArray(filters.filter)) {
        filters.filter.forEach((filter: IDataObject) => {
            const filterBy = filter.filterBy as string;
            const filterValue = filter.filterValue;

            if (filterBy && filterValue !== undefined && filterValue !== '') {
                queryParams[filterBy] = filterValue;
            }
        });
    }

    return queryParams;
}
```

### Data Transformation

For operations that need data transformation:

```typescript
private transformContactData(contactData: IDataObject): IDataObject {
    return {
        First_Name: contactData.firstName,
        Last_Name: contactData.lastName,
        Email: contactData.email,
        Phone: contactData.phone,
        Mobile: contactData.mobile,
        // ... more mappings
    };
}
```

---

## 🧪 Testing Phase 3

### Unit Testing

Test each handler method:

```typescript
describe('ZohoBigin Node', () => {
    describe('handlePipelineOperations', () => {
        it('should list pipelines', async () => {
            // Mock API request
            // Test listPipelines operation
        });

        it('should create pipeline', async () => {
            // Test createPipeline operation
        });
    });
});
```

### Integration Testing

Test with actual Bigin API:

1. **Setup**: Configure OAuth credentials with Bigin scopes
2. **Test Operations**:
   - Create a test pipeline
   - Retrieve the pipeline
   - Update the pipeline
   - Delete the pipeline
3. **Verify**: Check Bigin UI to confirm changes

### Manual Testing in n8n

1. Build the package: `npm run build`
2. Link to n8n: `npm link` (in package) and `npm link n8n-nodes-zoho` (in n8n)
3. Restart n8n
4. Create workflow with Zoho Bigin node
5. Test each operation

---

## 📋 Acceptance Criteria

Phase 3 is complete when:

1. ✅ **ZohoBigin.node.ts created** with complete structure
2. ✅ **All 7 resource handlers implemented**
3. ✅ **All CRUD operations functional**
4. ✅ **Error handling implemented** for all operations
5. ✅ **Pagination working** for list operations
6. ✅ **Filtering working** for list/search operations
7. ✅ **Data transformation** properly handles Bigin API format
8. ✅ **Code compiles** without errors
9. ✅ **TSLint passes**
10. ✅ **Manual testing** successful for core operations

---

## 🚨 Common Pitfalls

### 1. API Response Format

**Problem**: Bigin API returns data in nested structure

**Solution**: Always extract from `response.data`:
```typescript
const response = await zohoBiginApiRequest.call(...);
return response.data || [];  // Not just 'response'
```

### 2. Field Naming

**Problem**: Bigin uses underscored field names (First_Name, not firstName)

**Solution**: Transform data correctly:
```typescript
const body = {
    data: [{
        First_Name: firstName,  // Bigin format
        Last_Name: lastName,
    }],
};
```

### 3. Related Records

**Problem**: Lookups require special format

**Solution**: Use object with id property:
```typescript
{
    Account_Name: { id: accountId },  // Not just accountId
}
```

### 4. Bulk Operations

**Problem**: Single item gets wrapped in array

**Solution**: Always use data array:
```typescript
const body = {
    data: [itemData],  // Array even for single item
};
```

---

## 💡 Best Practices

1. **Consistent Error Handling**: Use try-catch in execute method
2. **continueOnFail Support**: Check `this.continueOnFail()` before throwing
3. **Type Safety**: Use proper type assertions for all getNodeParameter calls
4. **Data Validation**: Validate JSON inputs before parsing
5. **Clear Error Messages**: Help users understand what went wrong
6. **Logging**: Use console.log for debugging (visible in n8n logs)
7. **Handler Methods**: Keep execute method clean by delegating to handlers
8. **Code Organization**: Group related operations together

---

## ✅ Completion Checklist

Before moving to Phase 4:

- [ ] ZohoBigin.node.ts created
- [ ] All 7 handlers implemented
- [ ] All operations from Phase 2 functional
- [ ] Error handling tested
- [ ] Code compiles (`npm run build`)
- [ ] TSLint passes (`npm run tslint`)
- [ ] Manual testing in n8n successful
- [ ] Documentation comments added
- [ ] Ready for package configuration

---

**Previous Phase**: [Phase 2: Node Descriptions](./phase-2-node-descriptions.md)

**Next Phase**: [Phase 4: Package Configuration](./phase-4-package-config.md)

**Related Modules**: All modules

**Status**: 📝 Documentation Complete - Ready for Implementation
