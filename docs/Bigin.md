# Zoho Bigin API Documentation

> **Version**: 1.4+ | **Status**: Production Ready ✅ | **Implementation**: Phase 8 Complete

## Overview

Zoho Bigin is a lightweight CRM designed for small businesses and startups. This n8n node provides comprehensive integration with the Bigin API v2, enabling complete automation of CRM operations across all modules with advanced features.

**Base URL**: Regional - automatically selected based on OAuth credentials
**Authentication**: OAuth 2.0
**API Version**: v2
**OAuth Scopes**: `ZohoBigin.modules.ALL,ZohoBigin.settings.ALL,ZohoBigin.users.ALL,ZohoBigin.org.read,ZohoBigin.coql.READ`

### Regional Support

The node automatically detects your Zoho data center region and uses the appropriate API endpoint:

| Region | Base URL |
|--------|----------|
| **US** | `https://www.zohoapis.com/bigin/v2` |
| **EU** | `https://www.zohoapis.eu/bigin/v2` |
| **AU** | `https://www.zohoapis.com.au/bigin/v2` |
| **IN** | `https://www.zohoapis.in/bigin/v2` |
| **CN** | `https://www.zohoapis.com.cn/bigin/v2` |
| **JP** | `https://www.zohoapis.jp/bigin/v2` |
| **SA** | `https://www.zohoapis.sa/bigin/v2` |
| **CA** | `https://www.zohoapis.ca/bigin/v2` |

---

## 📦 Available Resources (All Modules Complete)

### ✅ Pipelines (Deals)
Core sales pipeline and opportunity management module.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Execute COQL, Get Deleted Records, Get Fields, Get Modules, Get Organization, Bulk Create, Bulk Update, Get Related Records, Update Related Records, List Attachments, Delete Attachment, Upload Photo, Download Photo, Delete Photo, Upload File, Download File, Delete File, Send Email, Change Owner

**Key Fields**: `Deal_Name`, `Stage`, `Amount`, `Closing_Date`, `Contact_Name`, `Account_Name`, `Pipeline`, `Probability`, `Next_Step`

### ✅ Contacts
Individual person/contact management.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Execute COQL, Get Deleted Records, Get Fields, Bulk Create, Bulk Update, Get Related Records, Update Related Records, List Attachments, Delete Attachment, Upload Photo, Download Photo, Delete Photo, Upload File, Download File, Delete File, Send Email, Change Owner

**Key Fields**: `First_Name`, `Last_Name`, `Email`, `Phone`, `Mobile`, `Account_Name`, `Title`, `Department`, `Data_Processing_Basis_Details` (GDPR)

**Special Features**: GDPR compliance support with Data Processing Basis tracking

### ✅ Accounts (Companies)
Company and organization management.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Execute COQL, Get Deleted Records, Get Fields, Bulk Create, Bulk Update, Get Related Records, Update Related Records, List Attachments, Delete Attachment, Upload Photo, Download Photo, Delete Photo, Upload File, Download File, Delete File, Send Email, Change Owner

**Key Fields**: `Account_Name`, `Website`, `Phone`, `Industry`, `Employees`, `Annual_Revenue`, `Parent_Account`, `Billing_*`, `Shipping_*`

### ✅ Products
Product catalog management.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Get Deleted Records, Get Fields, Bulk Create, Bulk Update, List Attachments, Delete Attachment

**Key Fields**: `Product_Name`, `Product_Code`, `Unit_Price`, `Product_Active`, `Taxable`, `Tax`, `Qty_in_Stock`, `Product_Category`

### ✅ Tasks
Task and to-do management.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Get Deleted Records, Get Fields, Bulk Create, Bulk Update, List Attachments, Delete Attachment

**Key Fields**: `Subject`, `Due_Date`, `Priority`, `Status`, `$se_module`, `What_Id`, `Description`, `Remind_At`

### ✅ Events
Calendar event and meeting management.

**Operations**: List, Get, Create, Update, Delete, Upsert, Search, Get Deleted Records, Get Fields, Bulk Create, Bulk Update, List Attachments, Delete Attachment

**Key Fields**: `Event_Title`, `Start_DateTime`, `End_DateTime`, `All_day`, `Venue`, `Participants`, `$se_module`, `What_Id`

### ✅ Notes
Notes and annotations for any module record.

**Operations**: List, Get, Create, Update, Delete, Get Fields

**Key Fields**: `Note_Title`, `Note_Content`, `Parent_Id`, `$se_module`

---

## 🚀 Advanced Features

### COQL Query Support
Execute SQL-like queries for complex data retrieval and reporting.

**Available for**: Pipelines, Contacts, Accounts
**Operation**: `executeCOQL`

**Example Query**:
```sql
SELECT Deal_Name, Stage, Amount, Closing_Date
FROM Pipelines
WHERE Amount > 5000 AND Stage != 'Closed Lost'
ORDER BY Amount DESC
LIMIT 100
```

**Features**:
- Full SQL syntax (SELECT, FROM, WHERE, ORDER BY, LIMIT)
- Joins across modules
- Complex filtering with AND/OR logic
- Date functions and comparisons
- Aggregations (COUNT, SUM, AVG, MIN, MAX)

### Upsert Operations
Create or update records in a single idempotent operation.

**Available for**: All main modules (Pipelines, Contacts, Accounts, Products, Tasks, Events)

**Parameters**:
- `duplicate_check_fields` - Array of fields to check for duplicates (e.g., `["Email"]` for Contacts)
- Record data

**Benefits**:
- Prevents duplicate creation
- Safe to retry on failure
- Simplifies integration logic

**Example**:
```json
{
  "operation": "upsert",
  "duplicate_check_fields": ["Email"],
  "data": {
    "Email": "john@example.com",
    "First_Name": "John",
    "Last_Name": "Doe"
  }
}
```

### Deleted Records API
Retrieve records that have been deleted for auditing and recovery.

**Available for**: All main modules
**Operation**: `getDeletedRecords`

**Parameters**:
- `type` - Filter type (`all`, `recycle`, `permanent`)
- `page`, `per_page` - Pagination

**Returns**: Deleted record IDs, deletion date, deletion type, deleted by user

### Bulk Operations
Process multiple records in a single API call (up to 100 records per batch).

**Available Operations**:
- `bulkCreateContacts` / `bulkCreatePipelines` / `bulkCreateAccounts` / `bulkCreateProducts` / `bulkCreateTasks` / `bulkCreateEvents`
- `bulkUpdateContacts` / `bulkUpdatePipelines` / `bulkUpdateAccounts` / `bulkUpdateProducts` / `bulkUpdateTasks` / `bulkUpdateEvents`

**Features**:
- Automatic batching (100 records per request)
- Rate limiting between batches
- Progress tracking
- Error handling per record

**Example**:
```json
{
  "operation": "bulkCreateContacts",
  "records": [
    {"Last_Name": "Doe", "Email": "john@example.com"},
    {"Last_Name": "Smith", "Email": "jane@example.com"},
    // ... up to 100 records
  ]
}
```

### Related Lists
Navigate relationships between modules and manage associated records.

**Available Operations**:
- `getRelatedRecords` - Get records related to a parent record
- `updateRelatedRecords` - Update multiple related records
- `delinkRelatedRecord` - Remove association without deleting

**Supported Relationships**:
- Pipelines → Contacts, Products, Tasks, Events, Notes
- Contacts → Pipelines, Tasks, Events, Notes
- Accounts → Contacts, Pipelines, Tasks, Events, Notes

**Example**:
```json
{
  "operation": "getRelatedRecords",
  "recordId": "4876876000000624001",
  "relatedModule": "Pipelines"
}
```

### Attachments & Files
Full file management for all modules.

**Operations**:
- `listAttachments` - List all files/attachments for a record
- `deleteAttachment` - Remove an attachment
- `uploadFile` - Upload file to a record
- `downloadFile` - Download file from a record
- `deleteFile` - Delete a file
- `uploadPhoto` - Upload photo (Contacts/Accounts)
- `downloadPhoto` - Download photo
- `deletePhoto` - Delete photo

### Email Integration
Send emails directly from Bigin records.

**Operation**: `sendEmail`
**Available for**: Pipelines, Contacts, Accounts

**Parameters**:
- `from` - From address (must be authorized in Bigin)
- `to` - Recipient email(s)
- `subject` - Email subject
- `content` - Email body (HTML supported)
- `cc`, `bcc` - Optional CC/BCC
- `attachments` - Optional file attachments

### Change Owner
Transfer record ownership between users.

**Operation**: `changeOwner`
**Available for**: Pipelines, Contacts, Accounts

**Parameters**:
- `recordIds` - Array of record IDs to transfer
- `newOwnerId` - Target user ID
- `notify` - Boolean to notify new owner

### Metadata & Settings APIs
Dynamic discovery of modules, fields, and organization settings.

**Operations**:
- `getModules` - Get all available modules
- `getFields` - Get field metadata for a module
- `getOrganization` - Get organization information

**Use Cases**:
- Dynamic form generation
- Field validation
- Custom field discovery
- Multi-org support

### Advanced Filtering
Powerful client-side and server-side filtering with 12 operators.

**Supported Operators**:
- `equals`, `not_equals` - Exact match/inverse
- `contains`, `not_contains` - Substring search
- `starts_with`, `ends_with` - Prefix/suffix match
- `greater_than`, `less_than` - Numeric/date comparison
- `between` - Range filter
- `in` - Multiple value match
- `is_empty`, `is_not_empty` - Null checks

**Example**:
```json
{
  "filters": [
    {"field": "Amount", "operator": "greater_than", "value": "1000"},
    {"field": "Stage", "operator": "in", "value": "Proposal,Negotiation,Closed Won"}
  ]
}
```

### Performance Optimizations
- **Metadata Caching**: 1-hour TTL for field metadata
- **Automatic Pagination**: `fetchAllPages()` helper for large datasets
- **Retry Logic**: Exponential backoff for transient failures
- **Rate Limiting**: Automatic delays between bulk operations

---

## 📖 Operation Details

### Common Operations (All Modules)

#### List Records
Retrieve all records with pagination, sorting, and filtering.

**Parameters**:
- `page` (number, default: 1) - Page number
- `perPage` (number, default: 200, max: 200) - Records per page
- `sortOrder` (options: asc/desc) - Sort direction
- `sortBy` (string) - Field to sort by
- `filters` (array) - Advanced filters

**Example**:
```json
{
  "resource": "pipeline",
  "operation": "listPipelines",
  "page": 1,
  "perPage": 50,
  "sortBy": "Amount",
  "sortOrder": "desc",
  "filters": [
    {"field": "Stage", "operator": "equals", "value": "Proposal"}
  ]
}
```

#### Get Record
Retrieve a specific record by ID.

**Parameters**:
- `{resource}Id` (string, required) - Record ID

**Example**:
```json
{
  "resource": "contact",
  "operation": "getContact",
  "contactId": "4876876000000624001"
}
```

#### Create Record
Create a new record.

**Parameters**:
- Record fields (varies by module)

**Example for Contact**:
```json
{
  "resource": "contact",
  "operation": "createContact",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "accountId": "4876876000000224003"
}
```

**Example for Pipeline**:
```json
{
  "resource": "pipeline",
  "operation": "createPipeline",
  "dealName": "Enterprise License Deal",
  "stage": "Qualification",
  "amount": 25000,
  "closeDate": "2025-12-31",
  "contactId": "4876876000000624001",
  "accountId": "4876876000000224003"
}
```

#### Update Record
Update an existing record.

**Parameters**:
- `{resource}Id` (string, required) - Record ID
- Updated field values

**Example**:
```json
{
  "resource": "pipeline",
  "operation": "updatePipeline",
  "pipelineId": "4876876000000225013",
  "stage": "Negotiation/Review",
  "amount": 27500
}
```

#### Delete Record
Delete a record.

**Parameters**:
- `{resource}Id` (string, required) - Record ID

**Example**:
```json
{
  "resource": "contact",
  "operation": "deleteContact",
  "contactId": "4876876000000624001"
}
```

#### Search Records
Search records using criteria query.

**Parameters**:
- `criteria` (string) - Search criteria in Bigin query format
- `page`, `perPage` - Pagination

**Example**:
```json
{
  "resource": "contact",
  "operation": "searchContacts",
  "criteria": "(Email:contains:@example.com) AND (Company:equals:Acme Corp)"
}
```

---

## 🔒 GDPR Compliance (Contacts Only)

Starting with version 1.0.3, the Zoho Bigin node supports GDPR data processing basis details for contacts, enabling compliance with GDPR Article 6.

### Data Processing Basis Field

The `Data_Processing_Basis_Details` field captures consent and legal basis information.

**Available Parameters**:
- **Data Processing Basis** (options) - Legal basis for processing (dynamically loaded from your Bigin account)
- **Contact Through Email** (boolean) - Email contact permission
- **Contact Through Phone** (boolean) - Phone contact permission
- **Contact Through Survey** (boolean) - Survey contact permission
- **Lawful Reason** (string) - Additional legal reasoning
- **Consent Remarks** (string) - Notes about consent
- **Consent Date** (dateTime) - When consent was obtained

**Standard Values** (English):
- Not Applicable
- Legitimate Interests
- Contract
- Legal Obligation
- Vital Interests
- Public Interests
- Pending
- Awaiting
- Obtained
- Not Responded

**Note**: Values are automatically fetched from your Bigin account and support localization (Hungarian, German, French, etc.)

### Example Usage

**In n8n UI**:
```
GDPR Compliance
├── Data Processing Basis: "Obtained"
├── Contact Through Email: true
├── Contact Through Phone: true
├── Contact Through Survey: false
├── Lawful Reason: "Customer relationship management"
├── Consent Remarks: "Consent obtained via website form"
└── Consent Date: "2025-01-15T10:30:00Z"
```

**Generated JSON**:
```json
{
  "Data_Processing_Basis_Details": {
    "Data_Processing_Basis": "Obtained",
    "Contact_Through_Email": true,
    "Contact_Through_Phone": true,
    "Contact_Through_Survey": false,
    "Lawful_Reason": "Customer relationship management",
    "Consent_Remarks": "Consent obtained via website form",
    "Consent_Date": "2025-01-15T10:30:00Z"
  }
}
```

### Bulk Operations with GDPR

Include `Data_Processing_Basis_Details` in your bulk data:

```json
[
  {
    "Last_Name": "Doe",
    "Email": "john.doe@example.com",
    "Data_Processing_Basis_Details": {
      "Data_Processing_Basis": "Obtained",
      "Contact_Through_Email": true,
      "Contact_Through_Phone": true
    }
  }
]
```

### Important Notes
- GDPR fields are **only available for Contacts module**
- Dropdown options are cached for 1 hour
- All GDPR parameters are optional
- Read-only fields (Owner, Created_Time, etc.) are included in API responses

---

## 🔧 Field Name Conventions

Bigin uses **underscore_case** for API field names (not camelCase):

| Display Name | API Field Name | Type |
|--------------|----------------|------|
| First Name | `First_Name` | string |
| Last Name | `Last_Name` | string |
| Email | `Email` | string |
| Deal Name | `Deal_Name` | string |
| Closing Date | `Closing_Date` | date |
| Account Name | `Account_Name` | lookup |

### Lookup Fields

Lookup fields (relationships) use object format:

```json
{
  "Contact_Name": {"id": "4876876000000624001"},
  "Account_Name": {"id": "4876876000000224003"}
}
```

**Not** just the ID string: ❌ `"Contact_Name": "4876876000000624001"`

### Custom Fields

Custom fields use `cf_` prefix:

```json
{
  "cf_industry": "Technology",
  "cf_company_size": "51-200",
  "cf_budget_confirmed": true
}
```

---

## 📊 Response Format

All Bigin API responses follow this structure:

### Success Response

```json
{
  "data": [
    {
      "code": "SUCCESS",
      "details": {
        "id": "4876876000000624001",
        "Created_Time": "2025-11-14T23:00:00+00:00",
        "Modified_Time": "2025-11-14T23:00:00+00:00"
      },
      "message": "record added",
      "status": "success"
    }
  ]
}
```

### Error Response

```json
{
  "data": [
    {
      "code": "INVALID_DATA",
      "details": {},
      "message": "Email is invalid",
      "status": "error"
    }
  ]
}
```

### List Response

```json
{
  "data": [
    {/* record 1 */},
    {/* record 2 */}
  ],
  "info": {
    "per_page": 200,
    "count": 2,
    "page": 1,
    "more_records": false
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Lead Capture Workflow

```
Webhook Trigger (Form Submission)
  ↓
Zoho Bigin - Create Contact
  ↓
Zoho Bigin - Create Pipeline
  ↓
Zoho Bigin - Create Task (Follow-up)
  ↓
Zoho Bigin - Send Email (Welcome)
```

### Use Case 2: CRM Sync

```
Schedule Trigger (Daily)
  ↓
External DB - Query New Records
  ↓
Zoho Bigin - Upsert Contacts (duplicate check: Email)
  ↓
Slack - Notify Team
```

### Use Case 3: Sales Report

```
Schedule Trigger (Weekly)
  ↓
Zoho Bigin - Execute COQL Query
  (SELECT Deal_Name, Amount FROM Pipelines WHERE Stage = 'Closed Won')
  ↓
Spreadsheet - Calculate Totals
  ↓
Email - Send Report to Management
```

### Use Case 4: Bulk Import

```
CSV File - Read Rows
  ↓
Function - Transform Data
  ↓
Zoho Bigin - Bulk Create Contacts (100 per batch)
  ↓
Google Sheets - Update Status
```

---

## ⚠️ Important Notes

### Rate Limiting
- Bigin API has rate limits (varies by plan)
- Bulk operations automatically add delays between batches
- Use bulk operations instead of loops when possible

### Date Format
- Use ISO 8601 format: `YYYY-MM-DD` for dates
- Use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ` for datetimes

### Required Fields
- **Contacts**: `Last_Name` is required
- **Pipelines**: `Deal_Name` is required
- **Accounts**: `Account_Name` is required
- **Products**: `Product_Name` is required
- **Tasks**: `Subject` is required
- **Events**: `Event_Title`, `Start_DateTime`, `End_DateTime` are required
- **Notes**: `Note_Content` is required

### Deleted Records
- Deleted records can be retrieved via `getDeletedRecords` operation
- Records stay in recycle bin for 60 days before permanent deletion
- Permanent deletion cannot be undone

### Binary Data
- Attachments and photos support binary data download
- Use `binaryProperty` parameter to specify where to store downloaded files
- Maximum file size varies by Bigin plan

---

## 🔗 API Reference Links

### Official Bigin API v2 Documentation
- **Main Documentation**: https://www.bigin.com/developer/docs/apis/v2/
- **Get Records API**: https://www.bigin.com/developer/docs/apis/v2/get-records.html
- **Insert Records API**: https://www.bigin.com/developer/docs/apis/v2/insert-records.html
- **Update Records API**: https://www.bigin.com/developer/docs/apis/v2/update-records.html
- **Delete Records API**: https://www.bigin.com/developer/docs/apis/v2/delete-records.html
- **Search Records API**: https://www.bigin.com/developer/docs/apis/v2/search-records.html
- **Field Meta Data API**: https://www.bigin.com/developer/docs/apis/v2/field-meta.html
- **Modules API**: https://www.bigin.com/developer/docs/apis/v2/modules-api.html
- **COQL Overview**: https://www.bigin.com/developer/docs/apis/v2/coql-overview.html
- **Bulk Write API**: https://www.bigin.com/developer/docs/apis/v2/bulk-write.html

---

## 📝 Version History

### Version 1.4+ (Current - Phase 8 Complete)
- ✅ All 7 modules fully implemented
- ✅ COQL query support for Pipelines, Contacts, Accounts
- ✅ Upsert operations for all main modules
- ✅ Deleted records API for all modules
- ✅ Modules & Settings APIs
- ✅ Performance enhancements with retry logic
- ✅ Related Lists API
- ✅ Send Email from Bigin
- ✅ Files & Attachments management
- ✅ Photos API for Contacts/Accounts
- ✅ Change Owner functionality
- ✅ GDPR compliance for Contacts
- ✅ Generalized field metadata system
- ✅ Advanced filtering (12 operators)
- ✅ Bulk operations optimization
- ✅ Metadata caching (1-hour TTL)
- ✅ Automatic pagination support

### Version 1.0.3
- ✅ GDPR compliance support for Contacts
- ✅ Dynamic picklist loading

### Version 1.0.0
- ✅ Initial release with Contacts module
- ✅ Basic CRUD operations

---

## 🎓 Additional Resources

- **Implementation Documentation**: `docs/bigin-implementation/`
- **Phase Documentation**: `docs/bigin-implementation/phases/`
- **Module Documentation**: `docs/bigin-implementation/modules/`
- **Developer Guide**: `CLAUDE.md`

---

## 🆘 Support & Troubleshooting

### Common Errors

**Error**: `INVALID_TOKEN`
**Solution**: Re-authenticate OAuth credentials in n8n

**Error**: `INVALID_DATA - Email is invalid`
**Solution**: Ensure email format is correct (e.g., `user@example.com`)

**Error**: `MANDATORY_NOT_FOUND - Last_Name`
**Solution**: Provide `Last_Name` field when creating Contacts

**Error**: `DUPLICATE_DATA`
**Solution**: Record with same unique field already exists. Use `upsert` operation instead.

**Error**: `LIMIT_EXCEEDED`
**Solution**: Rate limit reached. Add delays between requests or use bulk operations.

### Best Practices

1. **Use Upsert for Idempotency**: Prevents duplicate creation on retry
2. **Bulk Operations for Large Datasets**: Up to 100 records per request
3. **Cache Metadata**: Field metadata is cached for 1 hour automatically
4. **Use COQL for Complex Queries**: More efficient than multiple API calls
5. **Enable continueOnFail**: Process remaining items even if one fails
6. **Validate Data First**: Use `getFields` to discover required fields and validation rules

---

**Status**: ✅ Production Ready
**Last Updated**: 2025-01-31
**Node Version**: 1.4+
**Implementation**: Phase 8 Complete
