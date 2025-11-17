# Phase 7: Related Lists API

> Implement relationship navigation between modules using Bigin's Related Lists API

## 📋 Overview

Phase 7 focuses on implementing the Related Lists API, which allows retrieving, updating, and delinking records that are associated with a parent record. This enables workflows to navigate relationships between modules (e.g., get all Deals for a Contact, all Products in a Deal, etc.).

**Priority**: Medium (valuable for complex workflows)
**Estimated Effort**: 6-8 hours
**Dependencies**: Phase 6 complete
**Blocks**: None

## 🎯 Objectives

1. Implement "Get Related Records" operation for all supported relationships
2. Add "Update Related Records" operation
3. Add "Delink Related Records" operation
4. Support pagination for related lists
5. Support filtering on related records
6. Implement comprehensive error handling
7. Document all relationship types and use cases

## 📊 Supported Relationships

Based on Bigin API documentation:

### Contacts
- **Pipelines** (Deals associated with contact)
- **Attachments**
- **Emails**
- **Notes**
- **Activities**
- **Tasks**
- **Events**
- **Calls**

### Pipelines (Deals)
- **Products** (line items in deal)
- **Attachments**
- **Emails**
- **Notes**
- **Activities**
- **Tasks**
- **Events**
- **Calls**

### Accounts (Companies)
- **Pipelines** (Deals for account)
- **Contacts** (People at company)
- **Attachments**
- **Emails**
- **Notes**
- **Activities**
- **Tasks**
- **Events**
- **Calls**

### Products
- **Pipelines** (Deals using this product)
- **Attachments**

### Tasks
- **Notes**
- **Attachments**

### Events
- **Notes**
- **Attachments**

### Calls
- **Notes**

## 🔗 API Endpoints

### Get Related Records
```
GET /bigin/v2/{module_api_name}/{record_id}/{related_list_api_name}
```

**Example**:
```
GET /bigin/v2/Contacts/4876876000000624001/Pipelines
GET /bigin/v2/Pipelines/4876876000000625001/Products
GET /bigin/v2/Accounts/4876876000000626001/Contacts
```

**Query Parameters**:
- `page` - Page number (default: 1)
- `per_page` - Records per page (max: 200)
- `fields` - Comma-separated list of fields to include

### Update Related Records
```
PUT /bigin/v2/{module_api_name}/{record_id}/{related_list_api_name}
```

### Delink Related Records
```
DELETE /bigin/v2/{module_api_name}/{record_id}/{related_list_api_name}/{related_record_id}
```

**Example**:
```
DELETE /bigin/v2/Contacts/4876876000000624001/Pipelines/4876876000000625001
```

## 🚀 Implementation Plan

### Step 1: Add Related List Operations to Descriptions

For each main module (Contacts, Pipelines, Accounts, Products, Tasks, Events, Calls), add:

```typescript
{
    name: 'Get Related Records',
    value: 'getRelatedRecords',
    description: 'Get related records for this record',
}
```

### Step 2: Add Related List Type Parameter

```typescript
{
    displayName: 'Related List',
    name: 'relatedList',
    type: 'options',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact'],
            operation: ['getRelatedRecords'],
        },
    },
    options: [
        { name: 'Pipelines', value: 'Pipelines', description: 'Deals associated with this contact' },
        { name: 'Tasks', value: 'Tasks', description: 'Tasks for this contact' },
        { name: 'Events', value: 'Events', description: 'Events for this contact' },
        { name: 'Notes', value: 'Notes', description: 'Notes attached to this contact' },
        { name: 'Attachments', value: 'Attachments', description: 'Files attached to this contact' },
        { name: 'Emails', value: 'Emails', description: 'Emails related to this contact' },
        { name: 'Calls', value: 'Calls', description: 'Calls logged with this contact' },
        { name: 'Activities', value: 'Activities', description: 'All activities for this contact' },
    ],
    default: 'Pipelines',
    description: 'Type of related records to retrieve',
}
```

### Step 3: Add Parent Record ID Parameter

```typescript
{
    displayName: 'Record ID',
    name: 'recordId',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact'],
            operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord'],
        },
    },
    default: '',
    description: 'ID of the parent record',
    placeholder: '4876876000000624001',
}
```

### Step 4: Add Pagination Support

Reuse existing `paginationFields()` helper:

```typescript
...paginationFields('contact', 'getRelatedRecords'),
```

### Step 5: Implement Handler Methods

```typescript
} else if (operation === 'getRelatedRecords') {
    const recordId = context.getNodeParameter('recordId', itemIndex) as string;
    const relatedList = context.getNodeParameter('relatedList', itemIndex) as string;
    const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;

    // Use optimized fetchAllPages helper if returnAll is true
    if (returnAll) {
        return await ZohoBigin.fetchAllPages(
            context,
            `/Contacts/${recordId}/${relatedList}`,
        );
    }

    // Otherwise, fetch single page with limit
    const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
    const qs: IDataObject = {
        page: 1,
        per_page: limit,
    };

    const response = await zohoBiginApiRequest.call(
        context,
        'GET',
        `/Contacts/${recordId}/${relatedList}`,
        {},
        qs,
    );

    return response.data || [];
}
```

### Step 6: Implement Update Related Records

```typescript
} else if (operation === 'updateRelatedRecords') {
    const recordId = context.getNodeParameter('recordId', itemIndex) as string;
    const relatedList = context.getNodeParameter('relatedList', itemIndex) as string;
    const updateData = context.getNodeParameter('updateData', itemIndex) as string;

    let data: IDataObject[] = [];
    try {
        data = JSON.parse(updateData);
    } catch (error) {
        throw new NodeOperationError(
            context.getNode(),
            'Update data must be valid JSON array',
        );
    }

    const body = { data };

    const response = await zohoBiginApiRequest.call(
        context,
        'PUT',
        `/Contacts/${recordId}/${relatedList}`,
        body,
        {},
    );

    return response.data || [];
}
```

### Step 7: Implement Delink Related Records

```typescript
} else if (operation === 'delinkRelatedRecord') {
    const recordId = context.getNodeParameter('recordId', itemIndex) as string;
    const relatedList = context.getNodeParameter('relatedList', itemIndex) as string;
    const relatedRecordId = context.getNodeParameter('relatedRecordId', itemIndex) as string;

    const response = await zohoBiginApiRequest.call(
        context,
        'DELETE',
        `/Contacts/${recordId}/${relatedList}/${relatedRecordId}`,
        {},
        {},
    );

    return response.data?.[0]?.details || {};
}
```

## 📋 Parameter Definitions

### Get Related Records Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Record ID | string | Yes | ID of the parent record |
| Related List | options | Yes | Type of related records (Pipelines, Tasks, etc.) |
| Return All | boolean | No | Fetch all pages automatically (default: false) |
| Limit | number | No | Max records to return when Return All is false (default: 50) |

### Update Related Records Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Record ID | string | Yes | ID of the parent record |
| Related List | options | Yes | Type of related records to update |
| Update Data | JSON | Yes | Array of records to update with their IDs |

### Delink Related Record Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Record ID | string | Yes | ID of the parent record |
| Related List | options | Yes | Type of related record |
| Related Record ID | string | Yes | ID of the related record to delink |

## 📝 Example Use Cases

### Use Case 1: Get All Deals for a Contact

**Scenario**: Retrieve all deals (pipelines) associated with a specific contact.

**Configuration**:
- Resource: Contact
- Operation: Get Related Records
- Record ID: `4876876000000624001`
- Related List: Pipelines
- Return All: true

**Result**: Array of all pipeline (deal) records associated with the contact.

### Use Case 2: Get Products in a Deal

**Scenario**: Retrieve all products (line items) in a specific deal.

**Configuration**:
- Resource: Pipeline
- Operation: Get Related Records
- Record ID: `4876876000000625001`
- Related List: Products
- Limit: 100

**Result**: Up to 100 product records in the deal.

### Use Case 3: Get Contacts for an Account

**Scenario**: List all people (contacts) working at a specific company (account).

**Configuration**:
- Resource: Account
- Operation: Get Related Records
- Record ID: `4876876000000626001`
- Related List: Contacts
- Return All: true

**Result**: All contact records associated with the account.

### Use Case 4: Delink Contact from Deal

**Scenario**: Remove association between a contact and a deal.

**Configuration**:
- Resource: Contact
- Operation: Delink Related Record
- Record ID: `4876876000000624001` (contact ID)
- Related List: Pipelines
- Related Record ID: `4876876000000625001` (pipeline ID)

**Result**: Confirmation of delink operation.

## 🔄 Relationship Matrix

| Parent Module | Related Module | Operation Support | Use Case |
|--------------|----------------|-------------------|----------|
| Contacts | Pipelines | Get, Delink | View deals for contact |
| Contacts | Tasks | Get, Delink | View tasks assigned to contact |
| Contacts | Events | Get, Delink | View meetings with contact |
| Contacts | Notes | Get, Update, Delink | Manage contact notes |
| Pipelines | Products | Get, Update, Delink | Manage deal line items |
| Pipelines | Contacts | Get, Delink | View related contacts |
| Pipelines | Notes | Get, Update, Delink | Manage deal notes |
| Accounts | Contacts | Get, Delink | View people at company |
| Accounts | Pipelines | Get, Delink | View company deals |
| Products | Pipelines | Get | View deals using product |

## 🛠️ Technical Considerations

### Performance
- Leverage existing `fetchAllPages()` helper for automatic pagination
- Use existing metadata caching for field lookups
- Support filtering via query parameters

### Error Handling
- Validate parent record ID exists
- Handle invalid relationship types
- Check for permission errors (some relationships may be read-only)
- Provide clear error messages for unsupported relationships

### Caching
- Consider caching relationship metadata (which modules support which relationships)
- Cache can use same 1-hour TTL as field metadata

### Validation
- Validate that relationship type is supported for the parent module
- Validate record IDs are in correct format
- Validate JSON data for update operations

## 📚 Documentation Updates

### User Documentation (docs/Bigin.md)

Add new section:

```markdown
## Related Lists

Related Lists allow you to retrieve, update, and manage associations between records.

### Get Related Records

Retrieve records that are associated with a parent record.

**Example**: Get all deals for a contact
- Resource: Contact
- Operation: Get Related Records
- Record ID: `4876876000000624001`
- Related List: Pipelines

**Supported Relationships**:
- Contacts: Pipelines, Tasks, Events, Notes, Attachments, Emails, Calls, Activities
- Pipelines: Products, Contacts, Tasks, Events, Notes, Attachments, Emails, Calls
- Accounts: Contacts, Pipelines, Tasks, Events, Notes, Attachments, Emails, Calls
- Products: Pipelines, Attachments
- Tasks: Notes, Attachments
- Events: Notes, Attachments
- Calls: Notes

### Update Related Records

Update associated records (e.g., update product quantities in a deal).

### Delink Related Records

Remove associations between records without deleting the related record.
```

## ✅ Acceptance Criteria

1. ✅ **Get Related Records implemented** for all main modules
2. ✅ **Update Related Records implemented** where supported
3. ✅ **Delink Related Records implemented** for all relationships
4. ✅ **Pagination support** using Return All and Limit
5. ✅ **Error handling** for invalid relationships and IDs
6. ✅ **Documentation complete** with examples and relationship matrix
7. ✅ **Tested** with real API for common relationships
8. ✅ **Performance optimized** using fetchAllPages helper

## 🧪 Testing Checklist

- [ ] Get Pipelines for Contact
- [ ] Get Products for Pipeline
- [ ] Get Contacts for Account
- [ ] Get Tasks for Contact
- [ ] Get Notes for Pipeline
- [ ] Update Products in Pipeline
- [ ] Delink Contact from Pipeline
- [ ] Test pagination with Return All
- [ ] Test with non-existent record ID
- [ ] Test with invalid relationship type
- [ ] Test with read-only relationships

## 📦 Files to Modify

### Description Files
- `nodes/descriptions/BiginContactsDescription.ts` - Add related list operations
- `nodes/descriptions/BiginPipelinesDescription.ts` - Add related list operations
- `nodes/descriptions/BiginAccountsDescription.ts` - Add related list operations
- `nodes/descriptions/BiginProductsDescription.ts` - Add related list operations
- `nodes/descriptions/BiginTasksDescription.ts` - Add related list operations
- `nodes/descriptions/BiginEventsDescription.ts` - Add related list operations
- `nodes/descriptions/BiginNotesDescription.ts` - Add related list operations

### Main Node File
- `nodes/ZohoBigin.node.ts` - Add handler methods for each module

### Documentation
- `docs/Bigin.md` - Add Related Lists section with examples

## 🔮 Future Enhancements

Consider for later phases:

1. **Link Records**: Add ability to create new associations
2. **Batch Link/Delink**: Process multiple relationship changes at once
3. **Relationship Metadata**: Cache which relationships are available
4. **Smart Suggestions**: Suggest related lists based on parent module
5. **Visual Relationship Map**: Generate diagram of record relationships
6. **Cascade Options**: Handle cascading deletes for related records

## 🎓 Learning Resources

- [Bigin Related Lists API](https://www.bigin.com/developer/docs/apis/v2/related-lists.html)
- [Relationship Types Documentation](https://www.bigin.com/developer/docs/apis/v2/modules-api.html)
- [n8n Relationship Pattern Examples](https://docs.n8n.io/integrations/builtin/app-nodes/)

---

**Previous Phase**: [Phase 6: Advanced Features](./phase-6-advanced-features.md)

**Status**: 📝 Planned - Not Started

**Estimated Version**: 1.5 (Related Lists Support)

**Note**: This phase builds on the performance optimizations from Phase 6, leveraging automatic pagination and caching for efficient relationship navigation.
