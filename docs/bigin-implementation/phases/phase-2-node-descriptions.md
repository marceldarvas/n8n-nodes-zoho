# Phase 2: Node Descriptions

> Parameter and field definitions for all Bigin resources

## 📋 Overview

Phase 2 focuses on creating description files that define the operations, parameters, and fields for each Bigin resource. These description files follow the established pattern used in ZohoBilling and provide the UI configuration for the n8n node.

**Priority**: High
**Estimated Effort**: 10-15 hours (all modules combined)
**Dependencies**: Phase 1 (Core Infrastructure)
**Blocks**: Phase 3 (Main Node Implementation)

## 🎯 Objectives

1. ✅ Create description files for all 7 Bigin modules
2. ✅ Define operations for each resource
3. ✅ Configure parameter fields with proper types and validations
4. ✅ Implement filter and pagination support
5. ✅ Use structured inputs (not JSON) where practical
6. ✅ Follow established naming conventions and patterns

## 📂 Directory Structure

All description files should be created in:
```
nodes/descriptions/
├── BiginPipelinesDescription.ts
├── BiginContactsDescription.ts
├── BiginAccountsDescription.ts
├── BiginProductsDescription.ts
├── BiginTasksDescription.ts
├── BiginEventsDescription.ts
├── BiginNotesDescription.ts
└── index.ts  (update to export new descriptions)
```

## 🏗️ File Structure Pattern

Each description file should follow this pattern:

```typescript
import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const {resource}Operations: INodeProperties[] = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: { resource: ['{resource}'] },
        },
        options: [
            { name: 'List', value: 'list{Resource}s', description: 'List all {resources}' },
            { name: 'Get', value: 'get{Resource}', description: 'Get a {resource}' },
            // ... more operations
        ],
        default: 'list{Resource}s',
    },
];

export const {resource}Fields: INodeProperties[] = [
    // Pagination
    ...paginationFields('{resource}', 'list{Resource}s'),

    // ID field
    {
        displayName: '{Resource} ID',
        name: '{resource}Id',
        type: 'string',
        required: true,
        displayOptions: {
            show: {
                resource: ['{resource}'],
                operation: ['get{Resource}', 'update{Resource}', 'delete{Resource}'],
            },
        },
        description: 'ID of the {resource}',
    },

    // Filters
    {
        displayName: 'Filters',
        name: 'filters',
        type: 'fixedCollection',
        // ... filter configuration
    },

    // Additional fields for create/update
    // ...
];
```

## 📝 Description Files to Create

### 1. BiginPipelinesDescription.ts

**Priority**: Highest (Core to Bigin functionality)

#### Operations to Implement

```typescript
options: [
    { name: 'List', value: 'listPipelines', description: 'List all pipeline records' },
    { name: 'Get', value: 'getPipeline', description: 'Get a pipeline record' },
    { name: 'Create', value: 'createPipeline', description: 'Create a pipeline record' },
    { name: 'Update', value: 'updatePipeline', description: 'Update a pipeline record' },
    { name: 'Delete', value: 'deletePipeline', description: 'Delete a pipeline record' },
    { name: 'Search', value: 'searchPipelines', description: 'Search pipeline records' },
    { name: 'Convert Stage', value: 'convertStage', description: 'Move pipeline to different stage' },
],
```

#### Key Fields

- **Pipeline ID** (string, required for get/update/delete)
- **Deal Name** (string, required for create)
- **Stage** (options: Qualification, Needs Analysis, Value Proposition, etc.)
- **Amount** (number)
- **Close Date** (dateTime)
- **Contact ID** (string - related contact)
- **Account ID** (string - related account/company)
- **Probability** (number, 0-100)
- **Pipeline** (options - different pipeline names)
- **Owner** (string - user ID)
- **Description** (string)

#### Filters

```typescript
{
    displayName: 'Filters',
    name: 'filters',
    type: 'fixedCollection',
    typeOptions: { multipleValues: true },
    options: [
        {
            name: 'filter',
            values: [
                {
                    displayName: 'Field Name',
                    name: 'filterBy',
                    type: 'options',
                    options: [
                        { name: 'Owner', value: 'Owner' },
                        { name: 'Stage', value: 'Stage' },
                        { name: 'Pipeline', value: 'Pipeline' },
                        { name: 'Amount Range', value: 'Amount' },
                        { name: 'Close Date', value: 'Closing_Date' },
                    ],
                },
                // ... filter value fields
            ],
        },
    ],
}
```

**See**: [Full Pipelines module documentation](../modules/pipelines.md)

---

### 2. BiginContactsDescription.ts

**Priority**: High

#### Operations

```typescript
options: [
    { name: 'List', value: 'listContacts', description: 'List all contacts' },
    { name: 'Get', value: 'getContact', description: 'Get a contact' },
    { name: 'Create', value: 'createContact', description: 'Create a contact' },
    { name: 'Update', value: 'updateContact', description: 'Update a contact' },
    { name: 'Delete', value: 'deleteContact', description: 'Delete a contact' },
    { name: 'Search', value: 'searchContacts', description: 'Search contacts' },
    { name: 'Bulk Create', value: 'bulkCreateContacts', description: 'Create multiple contacts' },
    { name: 'Bulk Update', value: 'bulkUpdateContacts', description: 'Update multiple contacts' },
],
```

#### Key Fields

- **Contact ID** (string)
- **First Name** (string)
- **Last Name** (string, required for create)
- **Email** (string, email type)
- **Phone** (string)
- **Mobile** (string)
- **Account Name/ID** (string - related account)
- **Title** (string - job title)
- **Department** (string)
- **Mailing Address** (structured: street, city, state, zip, country)
- **Owner** (string - user ID)

#### Filters

- Email contains
- Phone contains
- Account ID
- Owner
- Created time
- Modified time

**See**: [Full Contacts module documentation](../modules/contacts.md)

---

### 3. BiginAccountsDescription.ts

**Priority**: High

#### Operations

```typescript
options: [
    { name: 'List', value: 'listAccounts', description: 'List all companies/accounts' },
    { name: 'Get', value: 'getAccount', description: 'Get a company/account' },
    { name: 'Create', value: 'createAccount', description: 'Create a company/account' },
    { name: 'Update', value: 'updateAccount', description: 'Update a company/account' },
    { name: 'Delete', value: 'deleteAccount', description: 'Delete a company/account' },
    { name: 'Search', value: 'searchAccounts', description: 'Search companies/accounts' },
],
```

#### Key Fields

- **Account ID** (string)
- **Account Name** (string, required for create)
- **Website** (string, url type)
- **Phone** (string)
- **Industry** (options: Technology, Healthcare, Finance, etc.)
- **Employees** (number)
- **Annual Revenue** (number)
- **Billing Address** (structured)
- **Shipping Address** (structured)
- **Owner** (string - user ID)
- **Parent Account** (string - account ID for hierarchies)

**See**: [Full Accounts module documentation](../modules/accounts.md)

---

### 4. BiginProductsDescription.ts

**Priority**: Medium

#### Operations

```typescript
options: [
    { name: 'List', value: 'listProducts', description: 'List all products' },
    { name: 'Get', value: 'getProduct', description: 'Get a product' },
    { name: 'Create', value: 'createProduct', description: 'Create a product' },
    { name: 'Update', value: 'updateProduct', description: 'Update a product' },
    { name: 'Delete', value: 'deleteProduct', description: 'Delete a product' },
],
```

#### Key Fields

- **Product ID** (string)
- **Product Name** (string, required)
- **Product Code** (string)
- **Unit Price** (number)
- **Description** (string)
- **Active** (boolean)
- **Taxable** (boolean)
- **Tax** (number - percentage)
- **Manufacturer** (string)
- **Category** (string)
- **Quantity in Stock** (number)
- **Owner** (string - user ID)

**See**: [Full Products module documentation](../modules/products.md)

---

### 5. BiginTasksDescription.ts

**Priority**: Medium

#### Operations

```typescript
options: [
    { name: 'List', value: 'listTasks', description: 'List all tasks' },
    { name: 'Get', value: 'getTask', description: 'Get a task' },
    { name: 'Create', value: 'createTask', description: 'Create a task' },
    { name: 'Update', value: 'updateTask', description: 'Update a task' },
    { name: 'Delete', value: 'deleteTask', description: 'Delete a task' },
    { name: 'Mark Complete', value: 'markTaskComplete', description: 'Mark task as complete' },
],
```

#### Key Fields

- **Task ID** (string)
- **Subject** (string, required)
- **Due Date** (dateTime)
- **Priority** (options: High, Highest, Low, Lowest, Normal)
- **Status** (options: Not Started, In Progress, Completed, Deferred)
- **Related To** (string - module name: Contacts, Accounts, Pipelines)
- **Related Record ID** (string)
- **Owner** (string - user ID)
- **Description** (string)
- **Reminder** (dateTime)

**See**: [Full Tasks module documentation](../modules/tasks.md)

---

### 6. BiginEventsDescription.ts

**Priority**: Medium

#### Operations

```typescript
options: [
    { name: 'List', value: 'listEvents', description: 'List all events' },
    { name: 'Get', value: 'getEvent', description: 'Get an event' },
    { name: 'Create', value: 'createEvent', description: 'Create an event' },
    { name: 'Update', value: 'updateEvent', description: 'Update an event' },
    { name: 'Delete', value: 'deleteEvent', description: 'Delete an event' },
],
```

#### Key Fields

- **Event ID** (string)
- **Title** (string, required)
- **Start DateTime** (dateTime, required)
- **End DateTime** (dateTime, required)
- **Location** (string)
- **All Day Event** (boolean)
- **Participants** (array of contact/user IDs)
- **Related To** (string - module name)
- **Related Record ID** (string)
- **Description** (string)
- **Reminder** (number - minutes before)

**See**: [Full Events module documentation](../modules/events.md)

---

### 7. BiginNotesDescription.ts

**Priority**: Lower

#### Operations

```typescript
options: [
    { name: 'List', value: 'listNotes', description: 'List notes for a record' },
    { name: 'Get', value: 'getNote', description: 'Get a note' },
    { name: 'Create', value: 'createNote', description: 'Create a note' },
    { name: 'Update', value: 'updateNote', description: 'Update a note' },
    { name: 'Delete', value: 'deleteNote', description: 'Delete a note' },
],
```

#### Key Fields

- **Note ID** (string)
- **Note Title** (string)
- **Note Content** (string, required)
- **Parent Module** (options: Contacts, Accounts, Pipelines, Products)
- **Parent ID** (string, required)
- **Owner** (string - user ID)

**See**: [Full Notes module documentation](../modules/notes.md)

---

## 🔄 Common Patterns Across All Modules

### Pagination Fields

All list operations should include pagination using the shared pattern:

```typescript
...paginationFields('{resource}', 'list{Resource}s'),
```

This typically provides:
- **Page** (number, default: 1)
- **Per Page** (number, default: 200, max: 200)

### Filter Implementation

Use `fixedCollection` with `multipleValues: true`:

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
            resource: ['{resource}'],
            operation: ['list{Resource}s', 'search{Resource}s'],
        },
    },
    options: [
        {
            displayName: 'Filter',
            name: 'filter',
            values: [
                // Filter field definitions
            ],
        },
    ],
}
```

### Structured Input vs JSON

**Use Structured Inputs For**:
- Contact creation (First Name, Last Name, Email, etc.)
- Account creation (Account Name, Website, Industry, etc.)
- Task creation (Subject, Due Date, Priority, etc.)
- Common operations users perform frequently

**Use JSON Input For**:
- Custom fields (varies by user configuration)
- Advanced/rare operations
- Bulk operations
- Complex nested structures

**Pattern**:
```typescript
{
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'json',
    default: '{}',
    description: 'Additional fields as JSON object',
    displayOptions: {
        show: {
            resource: ['{resource}'],
            operation: ['create{Resource}', 'update{Resource}'],
        },
    },
}
```

---

## 📋 SharedFields Updates

Update `nodes/descriptions/SharedFields.ts` if needed:

### Add Bigin-Specific Common Fields

```typescript
/**
 * Common field for specifying Bigin record owner
 */
export function ownerField(resources: string[], operations: string[]): INodeProperties {
    return {
        displayName: 'Owner',
        name: 'owner',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: resources,
                operation: operations,
            },
        },
        description: 'User ID of the record owner',
    };
}

/**
 * Common field for Bigin custom fields
 */
export function customFieldsInput(resources: string[], operations: string[]): INodeProperties {
    return {
        displayName: 'Custom Fields',
        name: 'customFields',
        type: 'json',
        default: '{}',
        displayOptions: {
            show: {
                resource: resources,
                operation: operations,
            },
        },
        description: 'Custom fields as JSON object (e.g., {"cf_custom_field": "value"})',
    };
}
```

---

## 🔗 Update index.ts

Add exports to `nodes/descriptions/index.ts`:

```typescript
export * from './BiginPipelinesDescription';
export * from './BiginContactsDescription';
export * from './BiginAccountsDescription';
export * from './BiginProductsDescription';
export * from './BiginTasksDescription';
export * from './BiginEventsDescription';
export * from './BiginNotesDescription';
```

---

## 🧪 Testing Phase 2

### Validation Checklist

For each description file:

- [ ] **TypeScript compiles** without errors
- [ ] **All operations defined** with clear names and descriptions
- [ ] **Required fields marked** with `required: true`
- [ ] **displayOptions configured** correctly (proper show/hide logic)
- [ ] **Default values set** for all optional fields
- [ ] **Options arrays** provided for dropdown fields
- [ ] **Field types correct** (string, number, dateTime, boolean, options, etc.)
- [ ] **Descriptions helpful** and user-friendly
- [ ] **Naming consistent** with n8n conventions (camelCase for names, Title Case for displayName)

### Manual UI Testing

Once integrated into the node (Phase 3):

1. Open n8n workflow editor
2. Add Zoho Bigin node
3. For each resource:
   - Verify all operations appear
   - Check all fields display correctly
   - Confirm conditional fields show/hide properly
   - Test default values are appropriate
   - Ensure dropdowns have all options

---

## 📋 Acceptance Criteria

Phase 2 is complete when:

1. ✅ **All 7 description files created**
2. ✅ **All operations defined** for each resource
3. ✅ **All fields configured** with proper types and validations
4. ✅ **Filters implemented** for list operations
5. ✅ **Pagination supported** via shared fields
6. ✅ **index.ts updated** with new exports
7. ✅ **Code compiles** without errors
8. ✅ **TSLint passes**
9. ✅ **Consistent naming** across all files
10. ✅ **Documentation comments** added to complex fields

---

## 💡 Best Practices

1. **Clear Descriptions**: Every field should have a helpful description
2. **Sensible Defaults**: Set defaults that work for most use cases
3. **Required Fields**: Only mark truly required fields as `required: true`
4. **Conditional Display**: Use `displayOptions` to reduce UI clutter
5. **Validation**: Add `type` validation (email, url, dateTime, etc.) where applicable
6. **Placeholder Text**: Use `placeholder` to show example values
7. **Options Ordering**: Order dropdown options logically (alphabetical or by priority)
8. **Consistent Naming**:
   - Parameter name: `camelCase`
   - Display name: `Title Case`
   - Operation values: `verbNoun` (e.g., `listContacts`, `createPipeline`)

---

## 🚨 Common Pitfalls

### 1. Incorrect displayOptions

**Problem**: Fields show when they shouldn't or don't show when they should

**Solution**: Always test show/hide logic:
```typescript
displayOptions: {
    show: {
        resource: ['contact'],  // Must be array
        operation: ['createContact', 'updateContact'],  // Must be array
    },
}
```

### 2. Missing Default Values

**Problem**: Fields undefined in execute method

**Solution**: Always provide defaults:
```typescript
{
    name: 'page',
    type: 'number',
    default: 1,  // Always set default
}
```

### 3. Wrong Field Types

**Problem**: Type mismatch causes runtime errors

**Solution**: Use correct types:
- `string` - text input
- `number` - numeric input
- `boolean` - checkbox
- `options` - dropdown (single select)
- `multiOptions` - dropdown (multi-select)
- `dateTime` - date/time picker
- `json` - JSON editor
- `fixedCollection` - complex nested structures

### 4. Forgetting noDataExpression

**Problem**: Expression editor appears unnecessarily

**Solution**: Add to static dropdowns:
```typescript
{
    type: 'options',
    noDataExpression: true,  // Disable expression editor
    options: [...]
}
```

---

## ✅ Completion Checklist

Before moving to Phase 3:

- [ ] All 7 description files created
- [ ] index.ts updated with exports
- [ ] Code compiles (`npm run build`)
- [ ] TSLint passes (`npm run tslint`)
- [ ] All operations documented in this file
- [ ] Field patterns consistent across modules
- [ ] Ready for integration in Phase 3

---

**Previous Phase**: [Phase 1: Core Infrastructure](./phase-1-core-infrastructure.md)

**Next Phase**: [Phase 3: Main Node Implementation](./phase-3-main-node.md)

**Related Modules**: All modules depend on these descriptions

**Status**: 📝 Documentation Complete - Ready for Implementation
