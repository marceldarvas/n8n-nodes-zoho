# Zoho Integration Improvement Tasks

Based on comparison with native n8n Zoho CRM integration patterns and best practices.

**Last Updated:** 2025-11-13

---

## 🔴 High Priority Tasks

### Task 1: Remove Debug Code
**Priority:** Critical
**Effort:** 15 minutes
**Dependencies:** None
**Assignable:** Yes

**Description:**
Remove all console.log statements from production code to prevent console pollution and potential information leakage.

**Files to modify:**
- `nodes/GenericFunctions.ts` (lines 137, 140)
- `nodes/ZohoBilling.node.ts` (line 807, line 1187)

**Acceptance Criteria:**
- [ ] No console.log statements remain in any node files
- [ ] No console.error statements remain (replace with proper error handling)
- [ ] Code still functions correctly

**Example:**
```typescript
// REMOVE:
console.log('Subscription Request Options', options);
console.log(responseData);
console.log('execute');
console.error(`Unhandled operation ${operation}`);

// REPLACE console.error with:
throw new NodeOperationError(this.getNode(), `Operation '${operation}' is not supported for resource '${resource}'`);
```

---

### Task 2: Implement continueOnFail Error Handling
**Priority:** High
**Effort:** 1-2 hours
**Dependencies:** None
**Assignable:** Yes

**Description:**
Add proper error handling in the execute function to allow workflows to continue processing even when individual items fail. This is a standard n8n pattern.

**Files to modify:**
- `nodes/ZohoBilling.node.ts` - execute function
- `nodes/ZohoEmail.node.ts` - execute function
- `nodes/ZohoSheets.node.ts` - execute function
- `nodes/ZohoTasks.node.ts` - execute function

**Implementation Pattern:**
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
  const items = this.getInputData();
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const operation = this.getNodeParameter('operation', i) as string;
      // ... existing operation logic ...

      returnData.push({
        json: responseData as IDataObject,
        pairedItem: { item: i },
      });

    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error.message },
          pairedItem: { item: i },
        });
        continue;
      }
      throw error;
    }
  }

  return [returnData];
}
```

**Acceptance Criteria:**
- [ ] All node execute functions wrapped with try-catch
- [ ] continueOnFail() logic implemented
- [ ] pairedItem metadata added to all responses
- [ ] Errors are captured and returned as JSON when continueOnFail is true
- [ ] Test both modes: fail immediately and continue on fail

---

### Task 3: Add throwOnErrorStatus to API Requests
**Priority:** High
**Effort:** 30 minutes
**Dependencies:** None
**Assignable:** Yes

**Description:**
Add explicit error status checking to API responses to catch API-level errors that might not throw HTTP exceptions.

**Files to modify:**
- `nodes/GenericFunctions.ts`

**Implementation:**
```typescript
export function throwOnErrorStatus(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    responseData: {
        code?: number;
        message?: string;
        data?: Array<{ status: string; message: string }>;
    },
) {
    // Check for error status in response
    if (responseData?.code && responseData.code !== 0) {
        throw new NodeOperationError(
            this.getNode(),
            `Zoho API error: ${responseData.message || 'Unknown error'}`
        );
    }

    // Check for data-level errors
    if (responseData?.data?.[0]?.status === 'error') {
        throw new NodeOperationError(
            this.getNode(),
            responseData.data[0].message || 'API returned error status'
        );
    }
}

// Then in zohoSubscriptionsApiRequest:
try {
    const responseData = await this.helpers.request!(options);
    throwOnErrorStatus.call(this, responseData);  // ADD THIS
    return responseData;
} catch (error) {
    // existing error handling
}
```

**Acceptance Criteria:**
- [ ] throwOnErrorStatus function added to GenericFunctions.ts
- [ ] Called in both zohoApiRequest and zohoSubscriptionsApiRequest
- [ ] Handles both top-level and data-level error responses
- [ ] Test with intentionally invalid requests

---

### Task 4: Extract and Fix Base URL Logic
**Priority:** High
**Effort:** 1 hour
**Dependencies:** None
**Assignable:** Yes

**Description:**
Remove hardcoded base URL from execute function and derive it from credentials, supporting multiple regions (EU, US, AU, etc.).

**Files to modify:**
- `nodes/GenericFunctions.ts`
- `nodes/ZohoBilling.node.ts`

**Implementation:**

In GenericFunctions.ts:
```typescript
export function getSubscriptionsBaseUrl(accessTokenUrl: string): string {
    // Map token URL to API domain
    const urlMap: { [key: string]: string } = {
        'https://accounts.zoho.com/oauth/v2/token': 'https://www.zohoapis.com/billing/v1',
        'https://accounts.zoho.eu/oauth/v2/token': 'https://www.zohoapis.eu/billing/v1',
        'https://accounts.zoho.com.au/oauth/v2/token': 'https://www.zohoapis.com.au/billing/v1',
        'https://accounts.zoho.in/oauth/v2/token': 'https://www.zohoapis.in/billing/v1',
        'https://accounts.zoho.com.cn/oauth/v2/token': 'https://www.zohoapis.com.cn/billing/v1',
    };

    return urlMap[accessTokenUrl] || urlMap['https://accounts.zoho.com/oauth/v2/token'];
}
```

In ZohoBilling.node.ts execute function:
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const credentials = await this.getCredentials('zohoApi');
    const baseURL = getSubscriptionsBaseUrl(credentials.accessTokenUrl as string);

    // ... rest of execute logic
}
```

**Acceptance Criteria:**
- [ ] getSubscriptionsBaseUrl function added
- [ ] Supports all 5 Zoho regions (US, EU, AU, IN, CN)
- [ ] Base URL removed from hardcoded location
- [ ] Test with different region credentials

---

## 🟡 Medium Priority Tasks

### Task 5: Modularize Resource Descriptions
**Priority:** Medium
**Effort:** 4-6 hours
**Dependencies:** None (but benefits from Task 6)
**Assignable:** Yes (requires good understanding of n8n property structure)

**Description:**
Split monolithic node files into modular description files, one per resource, following n8n best practices.

**New structure to create:**
```
nodes/
  descriptions/
    CustomerDescription.ts
    ProductDescription.ts
    PlanDescription.ts
    AddonDescription.ts
    SubscriptionDescription.ts
    InvoiceDescription.ts
    PaymentDescription.ts
    EventDescription.ts
    ItemDescription.ts
    SharedFields.ts
    index.ts
```

**Implementation approach:**

1. Create SharedFields.ts with common field patterns:
```typescript
import type { INodeProperties } from 'n8n-workflow';

export const organizationId: INodeProperties = {
    displayName: 'Organization ID',
    name: 'organizationId',
    type: 'string',
    required: true,
    default: '',
    description: 'The Zoho Subscriptions Organization ID',
};

export const jsonDataField: INodeProperties = {
    displayName: 'JSON Data',
    name: 'jsonData',
    type: 'json',
    required: true,
    default: '{}',
    description: 'JSON object with the data to send',
};

// Add more shared fields
```

2. Create individual resource files (e.g., CustomerDescription.ts):
```typescript
import type { INodeProperties } from 'n8n-workflow';
import { organizationId } from './SharedFields';

export const customerOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['customer'] },
        },
        options: [
            { name: 'List', value: 'listCustomers', description: 'List all customers' },
            { name: 'Get', value: 'getCustomer', description: 'Retrieve details of a customer' },
            // ... other operations
        ],
        default: 'listCustomers',
    },
];

export const customerFields: INodeProperties[] = [
    // Customer ID field
    {
        displayName: 'Customer ID',
        name: 'customerId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['customer'],
                operation: ['getCustomer', 'updateCustomer', 'deleteCustomer'],
            },
        },
        default: '',
    },
    // ... other customer-specific fields
];
```

3. Update main node file to import and spread:
```typescript
import {
    customerOperations,
    customerFields,
    productOperations,
    productFields,
    // ... other imports
} from './descriptions';

export class ZohoBilling implements INodeType {
    description: INodeTypeDescription = {
        // ... metadata
        properties: [
            resourceSelect,
            ...customerOperations,
            ...customerFields,
            ...productOperations,
            ...productFields,
            // ... other resources
        ],
    };
}
```

**Acceptance Criteria:**
- [ ] All resource operations extracted to separate files
- [ ] All resource fields extracted to separate files
- [ ] SharedFields.ts contains reusable components
- [ ] index.ts exports all descriptions
- [ ] Main node file imports and uses descriptions
- [ ] Node still functions identically
- [ ] Code is more maintainable and readable

---

### Task 6: Replace JSON Fields with Structured Inputs
**Priority:** Medium
**Effort:** 6-8 hours
**Dependencies:** Task 5 (easier with modular structure)
**Assignable:** Yes (requires understanding of Zoho API schemas)

**Description:**
Replace raw JSON input fields with structured form fields for better UX and validation. Users should fill out forms, not write JSON.

**Example transformation:**

**Before:**
```typescript
{
    displayName: 'JSON Data',
    name: 'jsonData',
    type: 'json',
    required: true,
    default: '{}',
}

// In execute:
const jsonData = this.getNodeParameter('jsonData', i) as string;
const body = JSON.parse(jsonData);
```

**After:**
```typescript
// Required field
{
    displayName: 'Customer Name',
    name: 'customerName',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['customer'],
            operation: ['createCustomer'],
        },
    },
    default: '',
    description: 'Display name of the customer',
},

// Optional fields in collection
{
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
        show: {
            resource: ['customer'],
            operation: ['createCustomer'],
        },
    },
    options: [
        {
            displayName: 'Company Name',
            name: 'company_name',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Email',
            name: 'email',
            type: 'string',
            default: '',
        },
        {
            displayName: 'Phone',
            name: 'phone',
            type: 'string',
            default: '',
        },
        // ... more fields
    ],
},

// In execute:
const customerName = this.getNodeParameter('customerName', i) as string;
const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

const body = {
    display_name: customerName,
    ...additionalFields,
};
```

**Resources to update:**
- Customer (create, update)
- Product (create, update)
- Plan (create, update)
- Addon (create, update)
- Subscription (create, update)
- Invoice (create, update)
- Payment (create)

**Acceptance Criteria:**
- [ ] All create/update operations use structured fields
- [ ] Required fields are explicit, not hidden in JSON
- [ ] Optional fields in additionalFields/updateFields collections
- [ ] Field types match API expectations (string, number, boolean, etc.)
- [ ] Validation added where appropriate
- [ ] User testing shows improved UX

---

### Task 7: Implement loadOptions Methods
**Priority:** Medium
**Effort:** 3-4 hours
**Dependencies:** None
**Assignable:** Yes

**Description:**
Add dynamic dropdown options that fetch from Zoho API (e.g., organization list, customer list, product list).

**Implementation:**

Add methods object to node class:
```typescript
export class ZohoBilling implements INodeType {
    description: INodeTypeDescription = {
        // ... existing description
    };

    methods = {
        loadOptions: {
            async getOrganizations(this: ILoadOptionsFunctions) {
                const credentials = await this.getCredentials('zohoApi');
                const baseURL = getSubscriptionsBaseUrl(credentials.accessTokenUrl as string);

                // Note: Organizations endpoint varies by API
                const responseData = await zohoApiRequest.call(
                    this,
                    'GET',
                    baseURL,
                    '/organizations',
                    {},
                    {},
                );

                return responseData.organizations.map((org: any) => ({
                    name: org.name,
                    value: org.organization_id,
                }));
            },

            async getCustomers(this: ILoadOptionsFunctions) {
                const orgId = this.getNodeParameter('organizationId') as string;
                const credentials = await this.getCredentials('zohoApi');
                const baseURL = getSubscriptionsBaseUrl(credentials.accessTokenUrl as string);

                const responseData = await zohoSubscriptionsApiRequest.call(
                    this,
                    'GET',
                    `${baseURL}/customers`,
                    {},
                    { per_page: 200 },
                    orgId,
                );

                return responseData.customers.map((customer: any) => ({
                    name: customer.display_name,
                    value: customer.customer_id,
                }));
            },

            async getProducts(this: ILoadOptionsFunctions) {
                // Similar pattern
            },
        },
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        // ... existing execute
    }
}
```

Update field definitions to use loadOptions:
```typescript
{
    displayName: 'Organization',
    name: 'organizationId',
    type: 'options',
    typeOptions: {
        loadOptionsMethod: 'getOrganizations',
    },
    required: true,
    default: '',
},
{
    displayName: 'Customer',
    name: 'customerId',
    type: 'options',
    typeOptions: {
        loadOptionsMethod: 'getCustomers',
    },
    required: true,
    displayOptions: {
        show: {
            resource: ['subscription'],
            operation: ['createSubscription'],
        },
    },
    default: '',
},
```

**Acceptance Criteria:**
- [ ] loadOptions methods added for: organizations, customers, products, plans
- [ ] Dropdowns populate dynamically from API
- [ ] Pagination handled for large result sets
- [ ] Error handling for failed API calls
- [ ] Performance is acceptable (caching if needed)

---

### Task 8: Add Pagination Support
**Priority:** Medium
**Effort:** 2-3 hours
**Dependencies:** Task 4
**Assignable:** Yes

**Description:**
Implement automatic pagination for list operations to retrieve all results, not just the first page.

**Implementation:**

Add to GenericFunctions.ts:
```typescript
export async function zohoSubscriptionsApiRequestAllItems(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    organizationId: string,
    dataKey: string = 'data',
): Promise<any> {
    const returnData: IDataObject[] = [];

    let responseData;
    qs.page = 1;
    qs.per_page = qs.per_page || 200;

    do {
        responseData = await zohoSubscriptionsApiRequest.call(
            this,
            method,
            endpoint,
            body,
            qs,
            organizationId,
        );

        if (responseData[dataKey]) {
            returnData.push(...responseData[dataKey]);
        }

        qs.page++;
    } while (
        responseData.page_context &&
        responseData.page_context.has_more_page === true
    );

    return returnData;
}
```

Add "Return All" option to list operations:
```typescript
{
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    displayOptions: {
        show: {
            operation: ['listCustomers', 'listProducts', 'listInvoices'],
        },
    },
    default: false,
    description: 'Whether to return all results or only up to a given limit',
},
{
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    displayOptions: {
        show: {
            operation: ['listCustomers', 'listProducts', 'listInvoices'],
            returnAll: [false],
        },
    },
    typeOptions: {
        minValue: 1,
    },
    default: 50,
    description: 'Max number of results to return',
},
```

Update execute logic:
```typescript
if (operation === 'listCustomers') {
    const returnAll = this.getNodeParameter('returnAll', i) as boolean;

    if (returnAll) {
        responseData = await zohoSubscriptionsApiRequestAllItems.call(
            this,
            'GET',
            `${baseURL}/customers`,
            {},
            qs,
            orgId,
            'customers',
        );
    } else {
        const limit = this.getNodeParameter('limit', i) as number;
        qs.per_page = limit;
        const response = await zohoSubscriptionsApiRequest.call(
            this,
            'GET',
            `${baseURL}/customers`,
            {},
            qs,
            orgId,
        );
        responseData = response.customers;
    }

    returnData.push({ json: { customers: responseData } });
}
```

**Acceptance Criteria:**
- [ ] zohoSubscriptionsApiRequestAllItems function created
- [ ] All list operations support "Return All" option
- [ ] Limit option available when Return All is false
- [ ] Test with large datasets (1000+ items)
- [ ] Memory usage is reasonable

---

## 💡 Low Priority / Nice to Have Tasks

### Task 9: Add Shared Field Helpers
**Priority:** Low
**Effort:** 2 hours
**Dependencies:** Task 5
**Assignable:** Yes

**Description:**
Create reusable field helper functions for common patterns (filters, pagination, sorting).

**Files to create:**
- `nodes/descriptions/SharedFields.ts`

**Example helpers:**
```typescript
export function makeGetAllFields(resource: string): INodeProperties[] {
    return [
        {
            displayName: 'Return All',
            name: 'returnAll',
            type: 'boolean',
            displayOptions: { show: { resource: [resource], operation: ['getAll'] } },
            default: false,
        },
        {
            displayName: 'Limit',
            name: 'limit',
            type: 'number',
            displayOptions: {
                show: { resource: [resource], operation: ['getAll'], returnAll: [false] },
            },
            typeOptions: { minValue: 1, maxValue: 1000 },
            default: 50,
        },
        {
            displayName: 'Filters',
            name: 'filters',
            type: 'collection',
            placeholder: 'Add Filter',
            default: {},
            displayOptions: { show: { resource: [resource], operation: ['getAll'] } },
            options: [], // Populated by caller
        },
    ];
}
```

**Acceptance Criteria:**
- [ ] Helper functions reduce code duplication
- [ ] Consistent UX across resources
- [ ] Documentation for each helper

---

### Task 10: Add TypeScript Interfaces for API Responses
**Priority:** Low
**Effort:** 2-3 hours
**Dependencies:** None
**Assignable:** Yes

**Description:**
Define TypeScript interfaces for Zoho API request/response types for better type safety.

**Files to modify:**
- `nodes/types.ts`

**Example:**
```typescript
export interface ZohoSubscriptionsCustomer {
    customer_id: string;
    display_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    customer_type?: 'individual' | 'business';
    status?: 'active' | 'inactive';
    // ... more fields
}

export interface ZohoSubscriptionsProduct {
    product_id: string;
    name: string;
    status: string;
    // ... more fields
}

export interface ZohoSubscriptionsListResponse<T> {
    code: number;
    message: string;
    page_context: {
        page: number;
        per_page: number;
        has_more_page: boolean;
        total: number;
    };
    [key: string]: T[] | any; // customers, products, etc.
}
```

**Acceptance Criteria:**
- [ ] Interfaces defined for main entities
- [ ] API response types defined
- [ ] Used in function signatures where possible
- [ ] Better IDE autocomplete

---

### Task 11: Add Unit Tests
**Priority:** Low
**Effort:** 4-6 hours
**Dependencies:** Tasks 1-4 completed
**Assignable:** Yes (requires testing experience)

**Description:**
Add Jest unit tests for critical functions and edge cases.

**Files to create:**
- `nodes/__tests__/GenericFunctions.test.ts`
- `nodes/__tests__/ZohoBilling.test.ts`

**Example test:**
```typescript
import { getSubscriptionsBaseUrl, throwOnErrorStatus } from '../GenericFunctions';

describe('GenericFunctions', () => {
    describe('getSubscriptionsBaseUrl', () => {
        it('should return US URL for US token endpoint', () => {
            const result = getSubscriptionsBaseUrl('https://accounts.zoho.com/oauth/v2/token');
            expect(result).toBe('https://www.zohoapis.com/billing/v1');
        });

        it('should return EU URL for EU token endpoint', () => {
            const result = getSubscriptionsBaseUrl('https://accounts.zoho.eu/oauth/v2/token');
            expect(result).toBe('https://www.zohoapis.eu/billing/v1');
        });
    });

    describe('throwOnErrorStatus', () => {
        it('should throw on error code', () => {
            const mockContext = { getNode: () => ({}) };
            expect(() => {
                throwOnErrorStatus.call(mockContext, { code: 1001, message: 'Error' });
            }).toThrow('Zoho API error: Error');
        });

        it('should not throw on success', () => {
            const mockContext = { getNode: () => ({}) };
            expect(() => {
                throwOnErrorStatus.call(mockContext, { code: 0 });
            }).not.toThrow();
        });
    });
});
```

**Acceptance Criteria:**
- [ ] Tests for all GenericFunctions
- [ ] Tests for base URL derivation
- [ ] Tests for error handling
- [ ] Tests pass with `npm test`
- [ ] Coverage >70%

---

### Task 12: Improve API Documentation Comments
**Priority:** Low
**Effort:** 1-2 hours
**Dependencies:** None
**Assignable:** Yes

**Description:**
Add JSDoc comments with links to Zoho API documentation.

**Example:**
```typescript
/**
 * List all customers in a Zoho Subscriptions organization
 *
 * @see https://www.zoho.com/subscriptions/api/v1/customers/#list-customers
 *
 * Supported filters:
 * - email: Filter by customer email
 * - customer_name: Filter by customer name
 * - company_name: Filter by company name
 * - status: Filter by status (active, inactive, etc.)
 */
if (operation === 'listCustomers') {
    // implementation
}
```

**Acceptance Criteria:**
- [ ] All operations have JSDoc comments
- [ ] Links to relevant API documentation
- [ ] Parameter descriptions
- [ ] Example usage where helpful

---

## 📋 Task Dependencies Graph

```
High Priority (can run in parallel):
├── Task 1: Remove Debug Code (no dependencies)
├── Task 2: Implement continueOnFail (no dependencies)
├── Task 3: Add throwOnErrorStatus (no dependencies)
└── Task 4: Extract Base URL (no dependencies)

Medium Priority:
├── Task 5: Modularize Descriptions (no dependencies, but helps Task 6)
├── Task 6: Structured Inputs (easier after Task 5)
├── Task 7: loadOptions (no dependencies)
└── Task 8: Pagination (depends on Task 4)

Low Priority:
├── Task 9: Shared Helpers (depends on Task 5)
├── Task 10: TypeScript Interfaces (no dependencies)
├── Task 11: Unit Tests (easier after Tasks 1-4)
└── Task 12: Documentation (no dependencies)
```

---

## 🎯 Recommended Phases

### Phase 1: Code Quality & Stability (Week 1)
- Task 1: Remove Debug Code
- Task 2: Implement continueOnFail
- Task 3: Add throwOnErrorStatus
- Task 4: Extract Base URL Logic

**Goal:** Improve reliability and remove technical debt

### Phase 2: Architecture Improvements (Week 2)
- Task 5: Modularize Resource Descriptions
- Task 8: Add Pagination Support

**Goal:** Improve maintainability and scalability

### Phase 3: User Experience (Week 3)
- Task 6: Replace JSON Fields with Structured Inputs
- Task 7: Implement loadOptions Methods

**Goal:** Make the node easier to use

### Phase 4: Polish (Week 4)
- Task 9: Add Shared Field Helpers
- Task 10: Add TypeScript Interfaces
- Task 11: Add Unit Tests
- Task 12: Improve Documentation

**Goal:** Professional finish and long-term maintainability

---

## 📝 Notes

- **All tasks should include:** Testing before merging, updating any related documentation
- **Git workflow:** Each task should be a separate branch and PR
- **Breaking changes:** Tasks 5 and 6 may require version bump if they change node behavior
- **Communication:** Update this document as tasks are completed or priorities change
