# Zoho Bigin API Documentation

## Overview

Zoho Bigin is a lightweight CRM designed for small businesses and startups. This n8n node provides integration with the Bigin API, allowing you to automate contact management, deals, and other CRM operations.

**Base URL**: `https://www.zohoapis.com/bigin/v2`
**Authentication**: OAuth 2.0
**OAuth Scope**: `ZohoBigin.modules.ALL`

## Available Resources

### Contacts (Phase 1)
- Create Contact
- Get Contact
- Update Contact
- Delete Contact
- List Contacts
- Search Contacts

### Future Resources (Planned)
- Deals
- Products
- Activities
- Notes

---

## Contact Operations

### Create Contact

**Operation**: `create`
**HTTP Method**: `POST`
**Endpoint**: `/Contacts`
**OAuth Scope**: `ZohoBigin.modules.CREATE` or `ZohoBigin.modules.ALL`

Creates a new contact in Zoho Bigin.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| JSON Data | JSON | Yes | Contact data in JSON format |

#### Request Body Example

```json
{
  "First_Name": "John",
  "Last_Name": "Doe",
  "Email": "john.doe@example.com",
  "Phone": "+1-555-0123",
  "Mobile": "+1-555-0124",
  "Company": "Acme Inc.",
  "Title": "CTO",
  "Description": "Technical decision maker"
}
```

**Note**: The node automatically wraps your data in the required `data` array format.

#### Common Fields

| Field | Type | Description |
|-------|------|-------------|
| First_Name | string | Contact's first name |
| Last_Name | string | Contact's last name |
| Email | string | Primary email address |
| Phone | string | Primary phone number |
| Mobile | string | Mobile phone number |
| Company | string | Company name |
| Title | string | Job title |
| Description | string | Additional notes |
| Skype_ID | string | Skype username |
| Twitter | string | Twitter handle |
| Website | string | Website URL |
| Lead_Source | string | Source of the contact |
| Industry | string | Industry type |
| Annual_Revenue | number | Annual revenue |
| Number_Of_Employees | number | Company size |

#### Response Example

```json
{
  "data": [{
    "code": "SUCCESS",
    "details": {
      "Modified_Time": "2025-11-14T23:00:00+00:00",
      "Modified_By": {
        "name": "User Name",
        "id": "4876876000000225001"
      },
      "Created_Time": "2025-11-14T23:00:00+00:00",
      "id": "4876876000000624001",
      "Created_By": {
        "name": "User Name",
        "id": "4876876000000225001"
      }
    },
    "message": "record added",
    "status": "success"
  }]
}
```

---

### Get Contact

**Operation**: `get`
**HTTP Method**: `GET`
**Endpoint**: `/Contacts/{contact_id}`
**OAuth Scope**: `ZohoBigin.modules.READ` or `ZohoBigin.modules.ALL`

Retrieves a specific contact by ID.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Contact ID | string | Yes | The unique identifier of the contact |

#### Example

**Contact ID**: `4876876000000624001`

#### Response Example

```json
{
  "data": [{
    "Owner": {
      "name": "User Name",
      "id": "4876876000000225001",
      "email": "user@example.com"
    },
    "Email": "john.doe@example.com",
    "Description": "Technical decision maker",
    "$currency_symbol": "$",
    "Company": "Acme Inc.",
    "$review_process": {
      "approve": false,
      "reject": false,
      "resubmit": false
    },
    "First_Name": "John",
    "Full_Name": "John Doe",
    "Phone": "+1-555-0123",
    "Mobile": "+1-555-0124",
    "Last_Name": "Doe",
    "Title": "CTO",
    "Created_Time": "2025-11-14T23:00:00+00:00",
    "Modified_Time": "2025-11-14T23:00:00+00:00",
    "id": "4876876000000624001"
  }]
}
```

---

### Update Contact

**Operation**: `update`
**HTTP Method**: `PUT`
**Endpoint**: `/Contacts/{contact_id}`
**OAuth Scope**: `ZohoBigin.modules.UPDATE` or `ZohoBigin.modules.ALL`

Updates an existing contact.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Contact ID | string | Yes | The ID of the contact to update |
| JSON Data | JSON | Yes | Updated contact data |

#### Request Body Example

```json
{
  "Email": "john.doe.new@example.com",
  "Title": "Chief Technology Officer",
  "Phone": "+1-555-9999"
}
```

**Note**: Only include fields you want to update. Omitted fields remain unchanged.

#### Response Example

```json
{
  "data": [{
    "code": "SUCCESS",
    "details": {
      "Modified_Time": "2025-11-14T23:15:00+00:00",
      "Modified_By": {
        "name": "User Name",
        "id": "4876876000000225001"
      },
      "Created_Time": "2025-11-14T23:00:00+00:00",
      "id": "4876876000000624001",
      "Created_By": {
        "name": "User Name",
        "id": "4876876000000225001"
      }
    },
    "message": "record updated",
    "status": "success"
  }]
}
```

---

### Delete Contact

**Operation**: `delete`
**HTTP Method**: `DELETE`
**Endpoint**: `/Contacts/{contact_id}`
**OAuth Scope**: `ZohoBigin.modules.DELETE` or `ZohoBigin.modules.ALL`

Deletes a contact from Bigin.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Contact ID | string | Yes | The ID of the contact to delete |

#### Response Example

```json
{
  "data": [{
    "code": "SUCCESS",
    "details": {
      "id": "4876876000000624001"
    },
    "message": "record deleted",
    "status": "success"
  }]
}
```

---

### List Contacts

**Operation**: `list`
**HTTP Method**: `GET`
**Endpoint**: `/Contacts`
**OAuth Scope**: `ZohoBigin.modules.READ` or `ZohoBigin.modules.ALL`

Retrieves all contacts with optional pagination and sorting.

#### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Page | number | No | 1 | Page number for pagination |
| Per Page | number | No | 200 | Records per page (max 200) |
| Sort Order | options | No | asc | Sort order (asc or desc) |
| Sort By | string | No | Created_Time | Field to sort by |

#### Additional Fields (Optional)

| Field | Type | Description |
|-------|------|-------------|
| Fields | string | Comma-separated list of fields to retrieve |
| Approved | options | Filter by approval status (true/false/both) |
| Converted | options | Filter by conversion status (true/false/both) |

#### Query Parameters Example

```
?page=1&per_page=50&sort_order=desc&sort_by=Modified_Time
```

#### Response Example

```json
{
  "data": [
    {
      "Owner": { "name": "User Name", "id": "4876876000000225001" },
      "Email": "john.doe@example.com",
      "First_Name": "John",
      "Last_Name": "Doe",
      "Full_Name": "John Doe",
      "Company": "Acme Inc.",
      "id": "4876876000000624001",
      "Created_Time": "2025-11-14T23:00:00+00:00"
    },
    {
      "Owner": { "name": "User Name", "id": "4876876000000225001" },
      "Email": "jane.smith@example.com",
      "First_Name": "Jane",
      "Last_Name": "Smith",
      "Full_Name": "Jane Smith",
      "Company": "Tech Corp",
      "id": "4876876000000624002",
      "Created_Time": "2025-11-14T22:00:00+00:00"
    }
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

### Search Contacts

**Operation**: `search`
**HTTP Method**: `GET`
**Endpoint**: `/Contacts/search`
**OAuth Scope**: `ZohoBigin.modules.READ` or `ZohoBigin.modules.ALL`

Searches contacts using COQL (Custom Object Query Language) criteria.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Search Criteria | string | Yes | COQL search criteria |
| Page | number | No | Page number for pagination |
| Per Page | number | No | Records per page (max 200) |

#### Additional Fields (Optional)

Same as List Contacts operation.

#### COQL Criteria Examples

**Exact Match**:
```
(Email:equals:john@example.com)
```

**Starts With**:
```
(First_Name:starts_with:John)
```

**Contains**:
```
(Company:contains:Tech)
```

**Multiple Conditions (AND)**:
```
((First_Name:starts_with:John)and(Email:contains:@example.com))
```

**Multiple Conditions (OR)**:
```
((Email:equals:john@example.com)or(Email:equals:jane@example.com))
```

#### Supported Operators

- `equals` - Exact match
- `starts_with` - Starts with
- `contains` - Contains substring
- `not_equal` - Not equal to
- `in` - In a list of values
- `not_in` - Not in a list of values

#### Response Format

Same as List Contacts operation.

---

## Error Handling

### Common Error Codes

| Code | Status | Description | Solution |
|------|--------|-------------|----------|
| INVALID_TOKEN | 401 | Access token is invalid or expired | Refresh OAuth credentials |
| INVALID_MODULE | 400 | Module name is incorrect | Check module name (Contacts, Deals, etc.) |
| INVALID_DATA | 400 | Request data is malformed | Validate JSON structure |
| MANDATORY_NOT_FOUND | 400 | Required field is missing | Include all required fields |
| DUPLICATE_DATA | 400 | Record already exists | Check for existing records first |
| RECORD_NOT_FOUND | 404 | Contact ID doesn't exist | Verify the contact ID |
| NO_PERMISSION | 403 | Insufficient permissions | Check OAuth scopes |
| INTERNAL_ERROR | 500 | Zoho server error | Retry the request |

### Error Response Example

```json
{
  "code": "MANDATORY_NOT_FOUND",
  "details": {
    "api_name": "Last_Name"
  },
  "message": "required field not found",
  "status": "error"
}
```

---

## Field Name Conventions

Bigin uses Pascal_Case with underscores for field names:
- ✅ `First_Name`, `Last_Name`, `Email`
- ❌ `firstName`, `last_name`, `email`

### Standard Fields

All contacts have these standard fields:
- `id` (auto-generated)
- `Owner` (object with user details)
- `Created_Time` (ISO 8601 timestamp)
- `Modified_Time` (ISO 8601 timestamp)
- `Created_By` (object with user details)
- `Modified_By` (object with user details)
- `$approved` (boolean)
- `$editable` (boolean)

### Custom Fields

Custom fields are prefixed with `cf_` in API responses:
- Example: `cf_customer_id`, `cf_source_campaign`

---

## Pagination

Bigin API uses offset-based pagination:

- **Default Page Size**: 200 records
- **Maximum Page Size**: 200 records
- **Page Numbers**: Start at 1 (not 0)

### Pagination Response

The `info` object in responses contains:
- `per_page`: Records per page
- `count`: Number of records in current page
- `page`: Current page number
- `more_records`: Boolean indicating if more pages exist

### Example: Iterating Through Pages

```javascript
// n8n workflow example
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await listContacts({ page, per_page: 200 });
  // Process response.data
  hasMore = response.info.more_records;
  page++;
}
```

---

## Rate Limits

Zoho Bigin API enforces rate limits:

- **Standard Plan**: 1,000 API calls per day
- **Professional Plan**: 5,000 API calls per day
- **Enterprise Plan**: 10,000 API calls per day

**Rate Limit Headers** (included in responses):
- `X-RATELIMIT-LIMIT`: Total allowed requests
- `X-RATELIMIT-REMAINING`: Remaining requests
- `X-RATELIMIT-RESET`: Time when limit resets (Unix timestamp)

### Best Practices

1. **Batch Operations**: Use bulk APIs when available
2. **Caching**: Cache frequently accessed data
3. **Error Handling**: Implement exponential backoff on 429 errors
4. **Pagination**: Fetch only necessary records per request

---

## Usage Examples

### Example 1: Create a Contact

**n8n Node Configuration**:
```
Resource: Contact
Operation: Create
JSON Data:
{
  "First_Name": "Alice",
  "Last_Name": "Johnson",
  "Email": "alice@techstartup.com",
  "Company": "Tech Startup Inc.",
  "Phone": "+1-555-1234",
  "Title": "Product Manager"
}
```

### Example 2: Search for Contacts by Email Domain

**n8n Node Configuration**:
```
Resource: Contact
Operation: Search
Search Criteria: (Email:contains:@techstartup.com)
Page: 1
Per Page: 50
```

### Example 3: Update Contact Phone Number

**n8n Node Configuration**:
```
Resource: Contact
Operation: Update
Contact ID: 4876876000000624001
JSON Data:
{
  "Phone": "+1-555-9999",
  "Mobile": "+1-555-8888"
}
```

### Example 4: List All Contacts (Sorted by Name)

**n8n Node Configuration**:
```
Resource: Contact
Operation: List
Page: 1
Per Page: 200
Sort Order: Ascending
Sort By: Full_Name
Additional Fields:
  - Fields: First_Name,Last_Name,Email,Phone,Company
```

---

## API Limits and Constraints

### Record Limits
- **Max Records Per API Call**: 200 (for list/search operations)
- **Max Records Per Batch Create**: 100
- **Max Records Per Batch Update**: 100

### Field Limits
- **Max Custom Fields**: 50 per module
- **Max Field Length (Text)**: 255 characters
- **Max Field Length (Textarea)**: 32,000 characters
- **Max Email Length**: 100 characters

### Search Constraints
- **Max Criteria Length**: 4,000 characters
- **Max Nested Conditions**: 25 levels

---

## Bulk Operations

The Zoho Bigin node supports bulk operations for efficiently creating and updating multiple records in a single API call. Bulk operations are available for Contacts, Pipelines, Accounts, and Products.

### Bulk Create

Create multiple records in a single operation (up to 100 records per batch).

**Operations Available**:
- Bulk Create Contacts
- Bulk Create Pipelines
- Bulk Create Accounts
- Bulk Create Products

**Example JSON Data (Contacts)**:
```json
[
  {
    "First_Name": "John",
    "Last_Name": "Doe",
    "Email": "john.doe@example.com",
    "Phone": "+1-555-0123"
  },
  {
    "First_Name": "Jane",
    "Last_Name": "Smith",
    "Email": "jane.smith@example.com",
    "Phone": "+1-555-0124"
  }
]
```

**Example JSON Data (Pipelines)**:
```json
[
  {
    "Deal_Name": "Enterprise Deal 1",
    "Amount": 50000,
    "Stage": "Qualification",
    "Closing_Date": "2025-12-31"
  },
  {
    "Deal_Name": "Enterprise Deal 2",
    "Amount": 75000,
    "Stage": "Needs Analysis",
    "Closing_Date": "2025-12-15"
  }
]
```

### Bulk Update

Update multiple records in a single operation (up to 100 records per batch). Each record must include an `id` field.

**Operations Available**:
- Bulk Update Contacts
- Bulk Update Pipelines
- Bulk Update Accounts
- Bulk Update Products

**Example JSON Data (Contacts)**:
```json
[
  {
    "id": "4150868000000224001",
    "Phone": "+1-555-9999",
    "Title": "Senior Manager"
  },
  {
    "id": "4150868000000224002",
    "Email": "updated@example.com",
    "Title": "Director"
  }
]
```

**Example JSON Data (Pipelines)**:
```json
[
  {
    "id": "4150868000000224005",
    "Stage": "Closed Won",
    "Amount": 60000
  },
  {
    "id": "4150868000000224006",
    "Stage": "Negotiation/Review",
    "Probability": 75
  }
]
```

### Bulk Operation Features

- **Automatic Batching**: If you provide more than 100 records, the node automatically splits them into batches
- **Rate Limiting**: Automatic 1-second delay between batches to respect API limits
- **Error Handling**: Individual record errors are returned in the response, allowing partial success
- **Progress Tracking**: All results (success and failures) are collected and returned

### Response Format

Bulk operations return an array of results for each record:

```json
[
  {
    "code": "SUCCESS",
    "details": {
      "id": "4150868000000624001",
      "Created_Time": "2025-11-15T10:00:00+00:00"
    },
    "message": "record added"
  },
  {
    "code": "DUPLICATE_DATA",
    "details": {
      "id": "4150868000000624002"
    },
    "message": "duplicate data"
  }
]
```

### Best Practices

1. **Batch Size**: Keep batches under 100 records per operation
2. **Validation**: Validate data structure before sending to avoid partial failures
3. **Error Handling**: Check response codes for each record to identify failures
4. **Required Fields**:
   - Bulk Create: Include all required fields (e.g., `Last_Name` for Contacts, `Deal_Name` for Pipelines)
   - Bulk Update: Always include the `id` field
5. **Performance**: Use bulk operations instead of looping individual create/update operations for better performance

---

## Advanced Filtering

The Zoho Bigin node supports advanced filtering with a comprehensive set of operators for precise data retrieval. Advanced filters are available for list and search operations across all modules (Contacts, Pipelines, Accounts, Products).

### Available Filter Operators

| Operator | Description | Example Usage |
|----------|-------------|---------------|
| **Equals** | Exact match | `Stage equals "Closed Won"` |
| **Not Equals** | Excludes exact match | `Stage not_equals "Closed Lost"` |
| **Contains** | Partial string match | `Email contains "@example.com"` |
| **Does Not Contain** | Excludes partial match | `Email not_contains "@spam.com"` |
| **Starts With** | Matches beginning of string | `Account_Name starts_with "Acme"` |
| **Ends With** | Matches end of string | `Email ends_with ".com"` |
| **Greater Than** | Numeric/date comparison | `Amount greater_than 5000` |
| **Less Than** | Numeric/date comparison | `Amount less_than 1000` |
| **Between** | Range comparison | `Amount between 1000,5000` |
| **In** | Matches any value in list | `Stage in "Qualification,Proposal"` |
| **Is Empty** | Field has no value | `Email is_empty` |
| **Is Not Empty** | Field has a value | `Phone is_not_empty` |

### Using Filters

Filters can be added in the node's UI under the "Filters" section. Multiple filters can be combined, and they are automatically joined with AND logic.

**Example 1: Filter Contacts by Email Domain**
```
Field: Email
Operator: Contains
Value: @example.com
```
Result: Returns all contacts with email addresses containing "@example.com"

**Example 2: Filter Pipelines by Amount Range**
```
Field: Amount
Operator: Between
Value: 5000,50000
```
Result: Returns all deals with amount between $5,000 and $50,000

**Example 3: Filter Accounts with Multiple Conditions**
```
Filter 1:
  Field: Industry
  Operator: Equals
  Value: Technology

Filter 2:
  Field: Website
  Operator: Is Not Empty
```
Result: Returns all technology companies that have a website

**Example 4: Filter Products by Multiple Values**
```
Field: Product_Category
Operator: In
Value: Electronics,Software,Hardware
```
Result: Returns products in any of the three categories

### Special Operator Notes

**Between Operator:**
- Use comma-separated values: `min,max`
- Example: `1000,5000` for values between 1000 and 5000

**In Operator:**
- Use comma-separated values for multiple options
- Example: `Value1,Value2,Value3`
- Useful for filtering by multiple stages, statuses, or categories

**Empty Operators:**
- `Is Empty` and `Is Not Empty` don't require a value
- Useful for data quality checks and finding incomplete records

### Combining with Search

For search operations, you can combine the search term with advanced filters. The search term and all filters are joined with AND logic.

**Example: Search Contacts**
```
Search Term: John
Filters:
  - Email is_not_empty
  - Created_Time greater_than 2025-01-01
```
Result: Finds contacts with "John" in their name, who have an email, and were created after January 1, 2025

### Filter Criteria Format

Behind the scenes, filters are converted to Zoho's criteria format:
- Simple: `(Field:operator:value)`
- Multiple: `(Field1:operator:value) AND (Field2:operator:value)`
- Negation: `NOT (Field:operator:value)`

### Best Practices

1. **Use Specific Operators**: Choose the most specific operator for better performance
   - Use `Equals` instead of `Contains` when possible
   - Use `Starts With` instead of `Contains` for prefix matching

2. **Combine Filters Efficiently**: Order filters from most restrictive to least
   - Put filters that eliminate the most records first
   - Combine complementary filters for precise results

3. **Empty Check Performance**: Use `Is Empty` / `Is Not Empty` for data validation
   - Find incomplete records quickly
   - Ensure data quality before processing

4. **Date/Number Filtering**: Use comparison operators for ranges
   - `Between` for ranges
   - `Greater Than` / `Less Than` for open-ended ranges

5. **Multi-Value Selection**: Use `In` operator for categorical data
   - Stages, statuses, categories
   - More efficient than multiple OR conditions

---

## Troubleshooting

### Issue: "Invalid Token" Error

**Cause**: OAuth access token expired or invalid
**Solution**:
1. Go to n8n credentials
2. Reconnect OAuth for Zoho API
3. Ensure scope includes `ZohoBigin.modules.ALL`

### Issue: "Required Field Not Found"

**Cause**: Missing mandatory fields (e.g., Last_Name)
**Solution**: Include all required fields in JSON Data:
- `Last_Name` is mandatory for contacts
- Check Bigin settings for other required fields

### Issue: "Duplicate Data" Error

**Cause**: Contact with same email already exists
**Solution**:
1. Search for existing contact first
2. Update instead of create
3. Or use a different email address

### Issue: Search Returns No Results

**Cause**: Incorrect COQL syntax or field names
**Solution**:
1. Verify field names use Pascal_Case (e.g., `First_Name`)
2. Check COQL syntax: `(Field:operator:value)`
3. Test with simple criteria first

---

## References

- [Official Bigin API Documentation](https://www.bigin.com/developer/docs/apis/v2/)
- [Bigin OAuth Documentation](https://www.bigin.com/developer/docs/apis/v2/oauth-overview.html)
- [Bigin API Scopes](https://www.bigin.com/developer/docs/apis/scopes.html)
- [COQL Query Language](https://www.bigin.com/developer/docs/apis/v2/query-language.html)
- [Bigin Modules API](https://www.bigin.com/developer/docs/apis/v2/modules-api.html)
- [n8n Documentation](https://docs.n8n.io/)

---

**Last Updated**: 2025-11-15
**Node Version**: 1.2 (Phase 6 - Advanced Features: Bulk Operations + Advanced Filtering)
**API Version**: v2
**Status**: Production Ready
