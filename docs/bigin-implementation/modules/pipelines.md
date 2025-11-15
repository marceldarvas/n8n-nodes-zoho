# Pipelines Module

> Complete documentation for the Bigin Pipelines resource

## 📋 Overview

The Pipelines module is the core of Zoho Bigin, representing sales opportunities (deals) as they move through various stages of your sales process. Unlike traditional CRM "Deals", Bigin uses the term "Pipelines" to emphasize the pipeline-centric approach.

**API Module Name**: `Pipelines`
**Priority**: Highest (Core functionality)
**Estimated Effort**: 4-5 hours

## 🎯 Key Concepts

### What is a Pipeline Record?

A pipeline record represents a potential sale or business opportunity. Each record contains:
- **Deal Name**: Name/title of the opportunity
- **Stage**: Current position in the sales pipeline
- **Amount**: Monetary value of the opportunity
- **Close Date**: Expected closing date
- **Contact**: Associated contact person
- **Account**: Associated company/organization
- **Probability**: Likelihood of closing (0-100%)
- **Owner**: Sales rep responsible for the deal

### Pipeline Stages

Common pipeline stages in Bigin:
1. **Qualification** - Initial contact, qualifying the lead
2. **Needs Analysis** - Understanding requirements
3. **Value Proposition** - Presenting solution
4. **Identify Decision Makers** - Finding key stakeholders
5. **Proposal/Price Quote** - Sending formal proposal
6. **Negotiation/Review** - Discussing terms
7. **Closed Won** - Successfully closed
8. **Closed Lost** - Opportunity lost

**Note**: Stages can be customized in Bigin settings and vary by pipeline type.

## 🔧 API Endpoints

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List | GET | `/Pipelines` | Get all pipeline records |
| Get | GET | `/Pipelines/{id}` | Get specific pipeline |
| Create | POST | `/Pipelines` | Create new pipeline |
| Update | PUT | `/Pipelines` | Update pipeline record |
| Delete | DELETE | `/Pipelines/{id}` | Delete pipeline |
| Search | GET | `/Pipelines/search` | Search pipelines |
| Convert Stage | PUT | `/Pipelines/{id}` | Move to different stage |

## 📝 Field Mapping

### API Field Names

Bigin uses underscored field names in the API:

| Display Name | API Field Name | Type | Required | Description |
|--------------|----------------|------|----------|-------------|
| Deal Name | `Deal_Name` | string | Yes | Name of the opportunity |
| Stage | `Stage` | picklist | No | Current pipeline stage |
| Amount | `Amount` | currency | No | Deal value |
| Closing Date | `Closing_Date` | date | No | Expected close date |
| Contact Name | `Contact_Name` | lookup | No | Related contact (lookup to Contacts) |
| Account Name | `Account_Name` | lookup | No | Related account (lookup to Accounts) |
| Pipeline | `Pipeline` | picklist | No | Pipeline type/category |
| Probability | `Probability` | percent | No | Win probability (0-100) |
| Owner | `Owner` | lookup | No | User responsible |
| Description | `Description` | textarea | No | Deal description/notes |
| Next Step | `Next_Step` | string | No | Next action to take |
| Lead Source | `Lead_Source` | picklist | No | How the lead originated |
| Created Time | `Created_Time` | datetime | Auto | When created |
| Modified Time | `Modified_Time` | datetime | Auto | Last modified |
| Created By | `Created_By` | lookup | Auto | User who created |
| Modified By | `Modified_By` | lookup | Auto | User who last modified |

### Custom Fields

Custom fields follow the pattern: `cf_custom_field_name`

Example:
```json
{
    "cf_industry": "Technology",
    "cf_company_size": "51-200",
    "cf_budget_confirmed": true
}
```

## 📥 Request/Response Examples

### List Pipelines

**Request**:
```http
GET /bigin/v2/Pipelines?page=1&per_page=200
Authorization: Zoho-oauthtoken {access_token}
```

**Response**:
```json
{
    "data": [
        {
            "Owner": {
                "name": "John Sales",
                "id": "4150868000000225001",
                "email": "john@example.com"
            },
            "Description": null,
            "Amount": 25000,
            "Probability": 75,
            "Next_Step": "Send proposal",
            "Stage": "Proposal/Price Quote",
            "Account_Name": {
                "name": "Acme Corp",
                "id": "4150868000000224003"
            },
            "id": "4150868000000225013",
            "Closing_Date": "2025-12-31",
            "Deal_Name": "Acme Enterprise License",
            "Contact_Name": {
                "name": "Jane Doe",
                "id": "4150868000000224005"
            },
            "Pipeline": "Sales Pipeline",
            "Created_Time": "2025-01-15T10:30:00+00:00",
            "Modified_Time": "2025-01-20T14:45:00+00:00"
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

### Get Pipeline

**Request**:
```http
GET /bigin/v2/Pipelines/4150868000000225013
Authorization: Zoho-oauthtoken {access_token}
```

**Response**:
```json
{
    "data": [
        {
            "Owner": { "name": "John Sales", "id": "4150868000000225001" },
            "Amount": 25000,
            "Stage": "Proposal/Price Quote",
            "id": "4150868000000225013",
            "Deal_Name": "Acme Enterprise License",
            // ... all fields
        }
    ]
}
```

### Create Pipeline

**Request**:
```http
POST /bigin/v2/Pipelines
Authorization: Zoho-oauthtoken {access_token}
Content-Type: application/json

{
    "data": [
        {
            "Deal_Name": "New Opportunity",
            "Stage": "Qualification",
            "Amount": 10000,
            "Closing_Date": "2025-06-30",
            "Contact_Name": { "id": "4150868000000224005" },
            "Account_Name": { "id": "4150868000000224003" },
            "Description": "Potential new client for our services",
            "Next_Step": "Schedule discovery call"
        }
    ]
}
```

**Response**:
```json
{
    "data": [
        {
            "code": "SUCCESS",
            "details": {
                "id": "4150868000000225099",
                "Created_Time": "2025-01-22T09:15:30+00:00",
                "Modified_Time": "2025-01-22T09:15:30+00:00",
                "Modified_By": { "name": "API User", "id": "4150868000000225001" },
                "Created_By": { "name": "API User", "id": "4150868000000225001" }
            },
            "message": "record added",
            "status": "success"
        }
    ]
}
```

### Update Pipeline

**Request**:
```http
PUT /bigin/v2/Pipelines
Authorization: Zoho-oauthtoken {access_token}
Content-Type: application/json

{
    "data": [
        {
            "id": "4150868000000225013",
            "Stage": "Negotiation/Review",
            "Amount": 27500,
            "Next_Step": "Finalize contract terms"
        }
    ]
}
```

**Response**:
```json
{
    "data": [
        {
            "code": "SUCCESS",
            "details": {
                "id": "4150868000000225013",
                "Modified_Time": "2025-01-22T10:30:00+00:00",
                "Modified_By": { "name": "API User", "id": "4150868000000225001" }
            },
            "message": "record updated",
            "status": "success"
        }
    ]
}
```

### Delete Pipeline

**Request**:
```http
DELETE /bigin/v2/Pipelines/4150868000000225013
Authorization: Zoho-oauthtoken {access_token}
```

**Response**:
```json
{
    "data": [
        {
            "code": "SUCCESS",
            "details": {
                "id": "4150868000000225013"
            },
            "message": "record deleted",
            "status": "success"
        }
    ]
}
```

### Search Pipelines

**Request**:
```http
GET /bigin/v2/Pipelines/search?criteria=(Stage:equals:Qualification)
Authorization: Zoho-oauthtoken {access_token}
```

**Response**: Same format as List, filtered by criteria

## 🔍 Filtering & Search

### Supported Filter Fields

- `Stage` - Filter by pipeline stage
- `Owner` - Filter by owner ID
- `Amount` - Filter by deal value
- `Closing_Date` - Filter by close date
- `Pipeline` - Filter by pipeline type
- `Account_Name` - Filter by associated account
- `Contact_Name` - Filter by associated contact

### Search Criteria Syntax

```
(field:operator:value)
```

Operators:
- `equals` - Exact match
- `contains` - Contains substring
- `starts_with` - Begins with
- `greater_than` - Greater than (numeric/date)
- `less_than` - Less than (numeric/date)
- `between` - Between two values

### Complex Search Examples

```
# High value deals in negotiation
(Stage:equals:Negotiation/Review) AND (Amount:greater_than:50000)

# Deals closing this month
(Closing_Date:between:2025-01-01,2025-01-31)

# Deals for specific account
(Account_Name:equals:4150868000000224003)

# Multiple stages
(Stage:in:Qualification,Needs Analysis,Value Proposition)
```

## 🎨 n8n Node Implementation

### Description File

Create `nodes/descriptions/BiginPipelinesDescription.ts`:

```typescript
import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const pipelinesOperations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['pipeline'] },
        },
        options: [
            { name: 'List', value: 'listPipelines', description: 'Get all pipeline records' },
            { name: 'Get', value: 'getPipeline', description: 'Get a pipeline record' },
            { name: 'Create', value: 'createPipeline', description: 'Create a pipeline record' },
            { name: 'Update', value: 'updatePipeline', description: 'Update a pipeline record' },
            { name: 'Delete', value: 'deletePipeline', description: 'Delete a pipeline record' },
            { name: 'Search', value: 'searchPipelines', description: 'Search pipeline records' },
        ],
        default: 'listPipelines',
    },
];

export const pipelinesFields: INodeProperties[] = [
    // Pagination
    ...paginationFields('pipeline', 'listPipelines'),

    // Pipeline ID (for get, update, delete)
    {
        displayName: 'Pipeline ID',
        name: 'pipelineId',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['getPipeline', 'updatePipeline', 'deletePipeline'],
            },
        },
        default: '',
        description: 'ID of the pipeline record',
    },

    // Create fields
    {
        displayName: 'Deal Name',
        name: 'dealName',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['createPipeline'],
            },
        },
        default: '',
        description: 'Name of the deal/opportunity',
    },
    {
        displayName: 'Stage',
        name: 'stage',
        type: 'options',
        options: [
            { name: 'Qualification', value: 'Qualification' },
            { name: 'Needs Analysis', value: 'Needs Analysis' },
            { name: 'Value Proposition', value: 'Value Proposition' },
            { name: 'Identify Decision Makers', value: 'Identify Decision Makers' },
            { name: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
            { name: 'Negotiation/Review', value: 'Negotiation/Review' },
            { name: 'Closed Won', value: 'Closed Won' },
            { name: 'Closed Lost', value: 'Closed Lost' },
        ],
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['createPipeline', 'updatePipeline'],
            },
        },
        default: 'Qualification',
        description: 'Current stage of the pipeline',
    },
    {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['createPipeline', 'updatePipeline'],
            },
        },
        default: 0,
        description: 'Deal value in base currency',
    },
    {
        displayName: 'Closing Date',
        name: 'closeDate',
        type: 'dateTime',
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['createPipeline', 'updatePipeline'],
            },
        },
        default: '',
        description: 'Expected closing date',
    },

    // Additional fields (JSON)
    {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'json',
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['createPipeline', 'updatePipeline'],
            },
        },
        default: '{}',
        description: 'Additional fields as JSON object',
        placeholder: '{"Contact_Name": {"id": "12345"}, "Description": "Notes here"}',
    },

    // Filters
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'fixedCollection',
        typeOptions: { multipleValues: true },
        placeholder: 'Add Filter',
        default: { filter: [] },
        displayOptions: {
            show: {
                resource: ['pipeline'],
                operation: ['listPipelines', 'searchPipelines'],
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
                            { name: 'Stage', value: 'Stage' },
                            { name: 'Owner', value: 'Owner' },
                            { name: 'Amount', value: 'Amount' },
                            { name: 'Closing Date', value: 'Closing_Date' },
                        ],
                        default: 'Stage',
                    },
                    {
                        displayName: 'Operator',
                        name: 'operator',
                        type: 'options',
                        options: [
                            { name: 'Equals', value: 'equals' },
                            { name: 'Greater Than', value: 'greater_than' },
                            { name: 'Less Than', value: 'less_than' },
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
    },
];
```

### Handler Implementation

In `nodes/ZohoBigin.node.ts`:

```typescript
private async handlePipelineOperations(
    operation: string,
    itemIndex: number,
    baseUrl: string,
): Promise<IDataObject | IDataObject[]> {
    if (operation === 'listPipelines') {
        const page = this.getNodeParameter('page', itemIndex, 1) as number;
        const perPage = this.getNodeParameter('perPage', itemIndex, 200) as number;
        const filters = this.getNodeParameter('filters', itemIndex, { filter: [] }) as IDataObject;

        const qs: IDataObject = { page, per_page: perPage };

        // Build criteria from filters
        if (filters.filter && Array.isArray(filters.filter)) {
            const criteria = filters.filter
                .map((f: any) => `(${f.field}:${f.operator}:${f.value})`)
                .join(' AND ');
            if (criteria) {
                qs.criteria = criteria;
            }
        }

        const response = await zohoBiginApiRequest.call(this, 'GET', '/Pipelines', {}, qs);
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
        const stage = this.getNodeParameter('stage', itemIndex, 'Qualification') as string;
        const amount = this.getNodeParameter('amount', itemIndex, 0) as number;
        const closeDate = this.getNodeParameter('closeDate', itemIndex, '') as string;
        const additionalFieldsJson = this.getNodeParameter('additionalFields', itemIndex, '{}') as string;

        let additionalFields: IDataObject = {};
        try {
            additionalFields = JSON.parse(additionalFieldsJson);
        } catch (error) {
            throw new NodeOperationError(this.getNode(), 'Additional fields must be valid JSON');
        }

        const body = {
            data: [
                {
                    Deal_Name: dealName,
                    Stage: stage,
                    Amount: amount,
                    ...(closeDate && { Closing_Date: closeDate }),
                    ...additionalFields,
                },
            ],
        };

        const response = await zohoBiginApiRequest.call(this, 'POST', '/Pipelines', body, {});
        return response.data?.[0]?.details || {};

    } else if (operation === 'updatePipeline') {
        const pipelineId = this.getNodeParameter('pipelineId', itemIndex) as string;
        const updateFieldsJson = this.getNodeParameter('updateFields', itemIndex, '{}') as string;

        let updateFields: IDataObject = {};
        try {
            updateFields = JSON.parse(updateFieldsJson);
        } catch (error) {
            throw new NodeOperationError(this.getNode(), 'Update fields must be valid JSON');
        }

        const body = {
            data: [
                {
                    id: pipelineId,
                    ...updateFields,
                },
            ],
        };

        const response = await zohoBiginApiRequest.call(this, 'PUT', '/Pipelines', body, {});
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
        const criteria = `(Deal_Name:contains:${searchTerm})`;
        const response = await zohoBiginApiRequest.call(
            this,
            'GET',
            '/Pipelines/search',
            {},
            { criteria },
        );
        return response.data || [];
    }

    throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
}
```

## ✅ Testing Checklist

- [ ] List all pipelines (empty state)
- [ ] List pipelines with data
- [ ] List with pagination (multiple pages)
- [ ] Get specific pipeline by ID
- [ ] Get with invalid ID (error handling)
- [ ] Create minimum pipeline (name only)
- [ ] Create full pipeline (all fields)
- [ ] Create with lookup fields (Contact, Account)
- [ ] Update pipeline stage
- [ ] Update multiple fields
- [ ] Delete pipeline
- [ ] Search by deal name
- [ ] Filter by stage
- [ ] Filter by amount range
- [ ] Filter by date range
- [ ] Complex multi-criteria search

## 🚨 Common Issues

1. **Lookup Fields**: Must use format `{"id": "12345"}`, not just the ID string
2. **Date Format**: Use ISO 8601 format: `YYYY-MM-DD`
3. **Stage Values**: Must match exactly (case-sensitive)
4. **Amount**: Numeric value, no currency symbols
5. **Required Fields**: Only `Deal_Name` is required for create

## 📚 Related Resources

- **Official API**: https://www.bigin.com/developer/docs/apis/v2/pipelines-api.html
- **Field Reference**: Retrieve via `/settings/fields?module=Pipelines`
- **Related Modules**: Contacts, Accounts, Products, Tasks

---

**Status**: 📝 Ready for Implementation
