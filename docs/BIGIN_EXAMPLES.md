# Zoho Bigin Usage Examples

> Comprehensive usage examples for the Zoho Bigin node in n8n workflows

## Table of Contents

1. [Basic Operations](#basic-operations)
   - [Pipelines](#pipelines-deals)
   - [Contacts](#contacts)
   - [Accounts](#accounts-companies)
   - [Products](#products)
   - [Tasks](#tasks)
   - [Events](#events)
   - [Notes](#notes)
2. [Workflow Examples](#workflow-examples)
3. [Advanced Use Cases](#advanced-use-cases)
4. [Troubleshooting](#troubleshooting)

---

## Basic Operations

### Pipelines (Deals)

Pipelines (also known as Deals) represent sales opportunities in your Bigin CRM.

#### Create a Pipeline

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "Create"
JSON Data: '{
  "Deal_Name": "Enterprise Software License",
  "Stage": "Qualification",
  "Amount": 50000,
  "Closing_Date": "2024-06-30",
  "Contact_Name": {"id": "4876876000000123001"},
  "Description": "Potential enterprise customer for our premium software package"
}'
```

**Field Explanation:**
- `Deal_Name`: Required - The name of the sales opportunity
- `Stage`: Required - Sales stage (e.g., Qualification, Proposal, Negotiation, Closed Won)
- `Amount`: The monetary value of the deal
- `Closing_Date`: Expected close date (YYYY-MM-DD format)
- `Contact_Name`: Related contact (lookup field with ID reference)
- `Description`: Additional details about the opportunity

#### List Pipelines

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "List"
Page: 1
Per Page: 50
Sort Order: "desc"
Sort By: "Amount"
```

This returns all pipelines, sorted by amount (highest first).

#### Get a Specific Pipeline

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "Get"
Pipeline ID: "4876876000000234567"
```

#### Update a Pipeline

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "Update"
Pipeline ID: "4876876000000234567"
JSON Data: '{
  "Stage": "Proposal",
  "Amount": 55000,
  "Notes": "Updated quote with additional services"
}'
```

#### Delete a Pipeline

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "Delete"
Pipeline ID: "4876876000000234567"
```

#### Search Pipelines with COQL

COQL (Zoho Common Query Language) allows advanced filtering and searching.

```javascript
// Node Configuration
Resource: "Pipelines"
Operation: "Search"
COQL Query: "select Deal_Name, Amount, Stage, Closing_Date from Deals where Stage = 'Qualification' and Amount > 10000 order by Amount desc"
```

**COQL Tips:**
- Use module API name "Deals" (not "Pipelines")
- Comparison operators: `=`, `!=`, `>`, `<`, `>=`, `<=`
- Logical operators: `and`, `or`, `not`
- String matching: `like` (e.g., `Deal_Name like '%Software%'`)

---

### Contacts

Manage individual contacts in your CRM.

#### Create a Contact

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Create"
JSON Data: '{
  "First_Name": "John",
  "Last_Name": "Doe",
  "Email": "john.doe@example.com",
  "Phone": "+1-555-0123",
  "Company": {"id": "4876876000000345678"},
  "Title": "VP of Engineering",
  "Mobile": "+1-555-0124"
}'
```

**Required Fields:**
- `Last_Name`: Minimum requirement for contact creation

**Common Fields:**
- `First_Name`, `Last_Name`, `Email`, `Phone`, `Mobile`
- `Company`: Link to an Account record
- `Title`: Job title
- `Lead_Source`: How the contact was acquired

#### Bulk Create Contacts

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Bulk Create"
JSON Data: '[
  {
    "First_Name": "Jane",
    "Last_Name": "Smith",
    "Email": "jane.smith@example.com",
    "Phone": "+1-555-0200"
  },
  {
    "First_Name": "Bob",
    "Last_Name": "Johnson",
    "Email": "bob.johnson@example.com",
    "Phone": "+1-555-0300"
  }
]'
```

**Note:** Bulk operations can create up to 100 records per API call.

#### List Contacts

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "List"
Page: 1
Per Page: 200
```

#### Search Contacts

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Search"
COQL Query: "select First_Name, Last_Name, Email, Phone from Contacts where Email like '%@example.com%' and Created_Time > '2024-01-01T00:00:00-05:00'"
```

#### Update a Contact

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Update"
Contact ID: "4876876000000456789"
JSON Data: '{
  "Title": "Senior VP of Engineering",
  "Email": "john.doe.new@example.com"
}'
```

#### Bulk Update Contacts

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Bulk Update"
JSON Data: '[
  {
    "id": "4876876000000456789",
    "Title": "Director of Sales"
  },
  {
    "id": "4876876000000456790",
    "Lead_Source": "Trade Show"
  }
]'
```

#### Delete a Contact

```javascript
// Node Configuration
Resource: "Contacts"
Operation: "Delete"
Contact ID: "4876876000000456789"
```

---

### Accounts (Companies)

Accounts represent companies or organizations in your CRM.

#### Create an Account

```javascript
// Node Configuration
Resource: "Accounts"
Operation: "Create"
JSON Data: '{
  "Account_Name": "Acme Corporation",
  "Website": "https://acme.example.com",
  "Industry": "Technology",
  "Annual_Revenue": 5000000,
  "Employees": 250,
  "Phone": "+1-555-1000",
  "Billing_City": "San Francisco",
  "Billing_State": "California",
  "Billing_Country": "USA"
}'
```

**Required Fields:**
- `Account_Name`: Company name

**Common Fields:**
- `Website`, `Industry`, `Annual_Revenue`, `Employees`
- Address fields: `Billing_Street`, `Billing_City`, `Billing_State`, `Billing_Code`, `Billing_Country`

#### List Accounts

```javascript
// Node Configuration
Resource: "Accounts"
Operation: "List"
Page: 1
Per Page: 100
```

#### Search Accounts

```javascript
// Node Configuration
Resource: "Accounts"
Operation: "Search"
COQL Query: "select Account_Name, Website, Industry, Annual_Revenue from Accounts where Industry = 'Technology' and Annual_Revenue > 1000000"
```

#### Update an Account

```javascript
// Node Configuration
Resource: "Accounts"
Operation: "Update"
Account ID: "4876876000000567890"
JSON Data: '{
  "Annual_Revenue": 6000000,
  "Employees": 300
}'
```

---

### Products

Manage your product and service catalog.

#### Create a Product

```javascript
// Node Configuration
Resource: "Products"
Operation: "Create"
JSON Data: '{
  "Product_Name": "Premium Support Package",
  "Unit_Price": 999.99,
  "Description": "24/7 premium technical support with dedicated account manager",
  "Product_Category": "Services",
  "Manufacturer": "Acme Corp",
  "Qty_in_Stock": 100
}'
```

**Required Fields:**
- `Product_Name`: Product or service name

#### List Products

```javascript
// Node Configuration
Resource: "Products"
Operation: "List"
Page: 1
Per Page: 50
```

#### Get a Product

```javascript
// Node Configuration
Resource: "Products"
Operation: "Get"
Product ID: "4876876000000678901"
```

#### Update a Product

```javascript
// Node Configuration
Resource: "Products"
Operation: "Update"
Product ID: "4876876000000678901"
JSON Data: '{
  "Unit_Price": 1099.99,
  "Qty_in_Stock": 150
}'
```

---

### Tasks

Create and manage tasks related to CRM activities.

#### Create a Task

```javascript
// Node Configuration
Resource: "Tasks"
Operation: "Create"
JSON Data: '{
  "Subject": "Follow up with prospect about pricing",
  "Due_Date": "2024-02-15",
  "Priority": "High",
  "Status": "Not Started",
  "Related_To": {"id": "4876876000000234567", "module": "Deals"},
  "Description": "Discuss custom pricing options and implementation timeline"
}'
```

**Common Fields:**
- `Subject`: Task description
- `Due_Date`: Deadline (YYYY-MM-DD format)
- `Priority`: Normal, High, Low
- `Status`: Not Started, In Progress, Completed, Deferred
- `Related_To`: Link to Pipeline, Contact, or Account

#### List Tasks

```javascript
// Node Configuration
Resource: "Tasks"
Operation: "List"
Page: 1
Per Page: 50
```

#### Update a Task

```javascript
// Node Configuration
Resource: "Tasks"
Operation: "Update"
Task ID: "4876876000000789012"
JSON Data: '{
  "Status": "Completed",
  "Description": "Successfully discussed pricing. Moving to proposal stage."
}'
```

---

### Events

Schedule and manage calendar events.

#### Create an Event

```javascript
// Node Configuration
Resource: "Events"
Operation: "Create"
JSON Data: '{
  "Event_Title": "Sales Demo - Acme Corporation",
  "Start_DateTime": "2024-02-10T14:00:00-05:00",
  "End_DateTime": "2024-02-10T15:00:00-05:00",
  "Participants": [
    {"type": "contact", "participant": "4876876000000456789"}
  ],
  "Related_To": {"id": "4876876000000234567", "module": "Deals"},
  "Description": "Product demonstration for enterprise package",
  "Location": "Virtual - Zoom"
}'
```

**Required Fields:**
- `Event_Title`: Event name
- `Start_DateTime`: Start time (ISO 8601 format with timezone)
- `End_DateTime`: End time

**DateTime Format:**
- Use ISO 8601: `YYYY-MM-DDTHH:MM:SS±HH:MM`
- Example: `2024-02-10T14:00:00-05:00` (2 PM EST)

#### List Events

```javascript
// Node Configuration
Resource: "Events"
Operation: "List"
Page: 1
Per Page: 50
```

#### Update an Event

```javascript
// Node Configuration
Resource: "Events"
Operation: "Update"
Event ID: "4876876000000890123"
JSON Data: '{
  "Start_DateTime": "2024-02-10T15:00:00-05:00",
  "End_DateTime": "2024-02-10T16:00:00-05:00"
}'
```

---

### Notes

Add notes to any CRM record for documentation and collaboration.

#### Create a Note

```javascript
// Node Configuration
Resource: "Notes"
Operation: "Create"
JSON Data: '{
  "Note_Title": "Initial Qualification Call Summary",
  "Note_Content": "Spoke with John Doe (VP Engineering). Key requirements:\n- Integration with existing systems\n- 24/7 support\n- Multi-region deployment\n\nBudget: $50k-75k\nTimeline: Q2 2024\nNext steps: Send proposal by Friday",
  "Parent_Id": {"id": "4876876000000234567", "module": "Deals"}
}'
```

**Required Fields:**
- `Note_Title`: Note heading
- `Note_Content`: Note body text
- `Parent_Id`: The record this note is attached to (Pipeline, Contact, Account, etc.)

#### List Notes

```javascript
// Node Configuration
Resource: "Notes"
Operation: "List"
Page: 1
Per Page: 100
```

#### Get a Note

```javascript
// Node Configuration
Resource: "Notes"
Operation: "Get"
Note ID: "4876876000000901234"
```

#### Update a Note

```javascript
// Node Configuration
Resource: "Notes"
Operation: "Update"
Note ID: "4876876000000901234"
JSON Data: '{
  "Note_Content": "Updated after second call: Budget confirmed at $60k. Decision maker identified as CTO."
}'
```

---

## Workflow Examples

### Workflow 1: Lead Capture to Pipeline

Automate lead capture from web forms to CRM pipelines.

```
[1] Webhook Trigger
    └─ Receives form submission data

[2] Zoho Bigin - Create Contact
    Resource: "Contacts"
    Operation: "Create"
    JSON Data: '{
      "First_Name": "{{$json["firstName"]}}",
      "Last_Name": "{{$json["lastName"]}}",
      "Email": "{{$json["email"]}}",
      "Phone": "{{$json["phone"]}}",
      "Lead_Source": "Website Form"
    }'

[3] Zoho Bigin - Create Account
    Resource: "Accounts"
    Operation: "Create"
    JSON Data: '{
      "Account_Name": "{{$json["company"]}}",
      "Website": "{{$json["website"]}}"
    }'

[4] Zoho Bigin - Create Pipeline
    Resource: "Pipelines"
    Operation: "Create"
    JSON Data: '{
      "Deal_Name": "{{$node["Webhook"].json["company"]}} - New Opportunity",
      "Stage": "Qualification",
      "Amount": {{$node["Webhook"].json["estimatedBudget"]}},
      "Contact_Name": {"id": "{{$node["Zoho Bigin"].json["data"][0]["details"]["id"]}}"},
      "Company": {"id": "{{$node["Zoho Bigin 1"].json["data"][0]["details"]["id"]}}"}
    }'

[5] Zoho Bigin - Create Task
    Resource: "Tasks"
    Operation: "Create"
    JSON Data: '{
      "Subject": "Follow up with new lead from website",
      "Due_Date": "{{$now.plus(2, "days").format("yyyy-MM-dd")}}",
      "Priority": "High",
      "Related_To": {"id": "{{$node["Zoho Bigin 2"].json["data"][0]["details"]["id"]}}", "module": "Deals"}
    }'

[6] Send Email Notification
    └─ Notify sales team about new qualified lead
```

---

### Workflow 2: Daily Sales Pipeline Report

Generate and send a daily report of active pipelines.

```
[1] Schedule Trigger
    └─ Daily at 8:00 AM

[2] Zoho Bigin - Search Pipelines
    Resource: "Pipelines"
    Operation: "Search"
    COQL Query: "select Deal_Name, Stage, Amount, Closing_Date from Deals where Stage in ('Qualification', 'Proposal', 'Negotiation') order by Amount desc"

[3] Function Node - Calculate Totals
    Code: `
    const pipelines = items[0].json.data;
    const totalValue = pipelines.reduce((sum, deal) => sum + (deal.Amount || 0), 0);
    const byStage = pipelines.reduce((acc, deal) => {
      if (!acc[deal.Stage]) acc[deal.Stage] = { count: 0, value: 0 };
      acc[deal.Stage].count++;
      acc[deal.Stage].value += deal.Amount || 0;
      return acc;
    }, {});

    return [{
      json: {
        totalPipelines: pipelines.length,
        totalValue: totalValue,
        byStage: byStage,
        pipelines: pipelines
      }
    }];
    `

[4] Send Email with Report
    Template: `
    <h2>Daily Sales Pipeline Report</h2>
    <p><strong>Total Active Pipelines:</strong> {{$json["totalPipelines"]}}</p>
    <p><strong>Total Pipeline Value:</strong> ${{$json["totalValue"].toLocaleString()}}</p>

    <h3>Breakdown by Stage:</h3>
    <ul>
      <li>Qualification: {{$json["byStage"]["Qualification"]["count"]}} deals - ${{$json["byStage"]["Qualification"]["value"]}}</li>
      <li>Proposal: {{$json["byStage"]["Proposal"]["count"]}} deals - ${{$json["byStage"]["Proposal"]["value"]}}</li>
      <li>Negotiation: {{$json["byStage"]["Negotiation"]["count"]}} deals - ${{$json["byStage"]["Negotiation"]["value"]}}</li>
    </ul>
    `
```

---

### Workflow 3: Contact Sync (Deduplication)

Sync contacts from external system while avoiding duplicates.

```
[1] External System Trigger
    └─ New contact webhook from CRM/Marketing platform

[2] Zoho Bigin - Search Contacts
    Resource: "Contacts"
    Operation: "Search"
    COQL Query: "select id, First_Name, Last_Name, Email from Contacts where Email = '{{$json["email"]}}'"

[3] IF Node - Check if Contact Exists
    Condition: {{$json["data"].length > 0}}

    ├─ True Path: Update Existing Contact
    │   [4a] Zoho Bigin - Update Contact
    │       Resource: "Contacts"
    │       Operation: "Update"
    │       Contact ID: "{{$node["Zoho Bigin"].json["data"][0]["id"]}}"
    │       JSON Data: '{
    │         "Phone": "{{$node["Webhook"].json["phone"]}}",
    │         "Title": "{{$node["Webhook"].json["title"]}}",
    │         "Modified_By_External": true
    │       }'
    │
    │   [5a] Zoho Bigin - Create Note
    │       JSON Data: '{
    │         "Note_Title": "Contact Updated via Sync",
    │         "Note_Content": "Contact information synchronized from external system at {{$now.format("yyyy-MM-dd HH:mm")}}",
    │         "Parent_Id": {"id": "{{$node["Zoho Bigin"].json["data"][0]["id"]}}", "module": "Contacts"}
    │       }'

    └─ False Path: Create New Contact
        [4b] Zoho Bigin - Create Contact
            Resource: "Contacts"
            Operation: "Create"
            JSON Data: '{
              "First_Name": "{{$node["Webhook"].json["firstName"]}}",
              "Last_Name": "{{$node["Webhook"].json["lastName"]}}",
              "Email": "{{$node["Webhook"].json["email"]}}",
              "Phone": "{{$node["Webhook"].json["phone"]}}",
              "Lead_Source": "External CRM Sync"
            }'
```

---

### Workflow 4: Bulk Contact Import from CSV

Import contacts from a CSV file with error handling.

```
[1] Manual Trigger or Schedule

[2] Google Sheets - Read Rows
    └─ Read contact data from spreadsheet

[3] Function Node - Batch Contacts
    Code: `
    // Bigin supports up to 100 records per bulk operation
    const batchSize = 100;
    const contacts = items.map(item => ({
      First_Name: item.json.FirstName,
      Last_Name: item.json.LastName,
      Email: item.json.Email,
      Phone: item.json.Phone,
      Company: item.json.Company ? {"id": item.json.CompanyId} : undefined
    }));

    const batches = [];
    for (let i = 0; i < contacts.length; i += batchSize) {
      batches.push({
        json: {
          contacts: contacts.slice(i, i + batchSize)
        }
      });
    }
    return batches;
    `

[4] Zoho Bigin - Bulk Create Contacts
    Resource: "Contacts"
    Operation: "Bulk Create"
    JSON Data: "{{JSON.stringify($json.contacts)}}"
    Continue On Fail: true

[5] Function Node - Track Results
    Code: `
    const successful = [];
    const failed = [];

    items.forEach(item => {
      if (item.json.data) {
        successful.push(...item.json.data);
      }
      if (item.error) {
        failed.push(item);
      }
    });

    return [{
      json: {
        successCount: successful.length,
        failedCount: failed.length,
        successful: successful,
        failed: failed
      }
    }];
    `

[6] Send Import Summary Email
```

---

## Advanced Use Cases

### Using COQL for Complex Queries

COQL (Zoho Common Query Language) enables sophisticated data retrieval.

#### Multi-Criteria Search

```javascript
// Find high-value opportunities closing soon
Resource: "Pipelines"
Operation: "Search"
COQL Query: "select Deal_Name, Amount, Stage, Closing_Date, Contact_Name from Deals where Amount > 25000 and Closing_Date <= '2024-03-31' and Stage != 'Closed Lost' order by Closing_Date asc"
```

#### Join-like Queries (Related Records)

```javascript
// Get contacts with their company information
Resource: "Contacts"
Operation: "Search"
COQL Query: "select First_Name, Last_Name, Email, Company.Account_Name, Company.Industry from Contacts where Company.Industry = 'Technology'"
```

#### Date-based Filtering

```javascript
// Pipelines created in the last 7 days
Resource: "Pipelines"
Operation: "Search"
COQL Query: "select Deal_Name, Amount, Created_Time from Deals where Created_Time >= '2024-01-15T00:00:00-05:00'"
```

#### Aggregation Alternatives

COQL doesn't support aggregation directly, but you can retrieve data and aggregate in n8n:

```javascript
// Function node after COQL search
const deals = $input.all()[0].json.data;

const summary = {
  totalDeals: deals.length,
  totalValue: deals.reduce((sum, deal) => sum + (deal.Amount || 0), 0),
  avgDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + (deal.Amount || 0), 0) / deals.length : 0,
  byStage: {}
};

deals.forEach(deal => {
  if (!summary.byStage[deal.Stage]) {
    summary.byStage[deal.Stage] = { count: 0, value: 0 };
  }
  summary.byStage[deal.Stage].count++;
  summary.byStage[deal.Stage].value += deal.Amount || 0;
});

return [{ json: summary }];
```

---

### Custom Fields

Bigin supports custom fields for extending standard modules.

#### Creating Records with Custom Fields

```javascript
// Custom fields use format: cf_{custom_field_id}
Resource: "Pipelines"
Operation: "Create"
JSON Data: '{
  "Deal_Name": "Enterprise Deal",
  "Amount": 100000,
  "Stage": "Qualification",
  "cf_4876876000000111111": "Inbound Marketing",
  "cf_4876876000000222222": "High"
}'
```

**Finding Custom Field IDs:**
1. Go to Bigin Settings → Modules → Select Module
2. View Custom Fields
3. Note the field ID (or retrieve via Bigin API metadata endpoints)

---

### Error Handling Best Practices

#### Retry Logic for API Failures

```
[1] Zoho Bigin Node
    └─ Continue On Fail: true

[2] IF Node - Check for Errors
    Condition: {{$json.error !== undefined}}

    ├─ True Path: Handle Error
    │   [3a] Wait 5 seconds
    │   [4a] Retry Zoho Bigin Operation
    │   [5a] Log to Error Tracking System

    └─ False Path: Continue Normal Flow
```

#### Validating Data Before API Calls

```javascript
// Function node before Bigin API call
const input = $input.all()[0].json;

// Validate required fields
const errors = [];

if (!input.Last_Name) {
  errors.push("Last_Name is required");
}

if (input.Email && !input.Email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
  errors.push("Invalid email format");
}

if (errors.length > 0) {
  throw new Error(`Validation failed: ${errors.join(", ")}`);
}

return [{ json: input }];
```

---

### Rate Limiting Considerations

Bigin API has rate limits. For bulk operations:

1. **Use Bulk Operations**: Prefer `Bulk Create` and `Bulk Update` (up to 100 records per call)
2. **Add Delays**: For sequential operations, add wait nodes
3. **Batch Processing**: Process large datasets in smaller batches

```
[Loop through batches]
  [1] Zoho Bigin - Bulk Create
  [2] Wait Node - 2 seconds
  [3] Continue to next batch
```

---

## Troubleshooting

### Common Errors and Solutions

#### Error: "INVALID_DATA - The given id is invalid"

**Cause:** Invalid record ID format or non-existent record.

**Solution:**
- Verify the ID is correct (typically 18-digit number)
- Ensure the record exists in Bigin
- Check you're using the correct module (Deals vs Contacts, etc.)

---

#### Error: "MANDATORY_NOT_FOUND - Required field missing"

**Cause:** Missing required field in Create or Update operation.

**Solution:**
- Check Bigin module settings for required fields
- Ensure JSON data includes all mandatory fields
- Example: Contacts require `Last_Name`, Pipelines require `Deal_Name`

---

#### Error: "DUPLICATE_DATA - Duplicate record"

**Cause:** Bigin detected a duplicate based on unique fields.

**Solution:**
- Search for existing record first
- Use Update instead of Create if record exists
- Implement deduplication workflow (see Workflow 3 above)

---

#### Error: "INVALID_TOKEN - Invalid OAuth token"

**Cause:** OAuth token expired or invalid credentials.

**Solution:**
- Re-authenticate in n8n Credentials
- Check Zoho OAuth scopes include `ZohoBigin.modules.ALL`
- Verify correct regional endpoint

---

#### Error: "LIMIT_EXCEEDED - API rate limit exceeded"

**Cause:** Too many API requests in short time.

**Solution:**
- Add wait/delay nodes between requests
- Use bulk operations instead of individual calls
- Implement exponential backoff retry logic

---

#### Search Returns No Results

**Cause:** Incorrect COQL query syntax or no matching records.

**Solution:**
- Verify COQL syntax (module name, field names)
- Test query in Bigin web interface first
- Check field API names (use underscore format: `First_Name` not `FirstName`)
- Ensure date formats are correct (ISO 8601)

---

### Debugging Tips

1. **Enable n8n Execution Logging**
   - View detailed request/response data
   - Check actual JSON sent to Bigin API

2. **Test COQL Queries in Bigin**
   - Use Bigin's search builder to validate queries
   - Export query syntax for use in n8n

3. **Validate JSON Syntax**
   - Use online JSON validators
   - Watch for trailing commas, quote escaping

4. **Check Field API Names**
   - Field labels in UI may differ from API names
   - Use Bigin API documentation or metadata endpoints

5. **Verify Lookup References**
   - Lookup fields require: `{"id": "record_id"}`
   - Ensure referenced records exist

---

### Additional Resources

- **Zoho Bigin API Documentation**: https://www.zoho.com/bigin/developer/
- **n8n Documentation**: https://docs.n8n.io/
- **COQL Guide**: https://www.zoho.com/crm/developer/docs/api/COQL-Overview.html
- **Zoho Developer Console**: https://api-console.zoho.com/

---

**Last Updated:** 2024-01-15
**Version:** 1.0 (Phase 5 - Testing & Documentation)

For issues or questions, please refer to the [GitHub repository](https://github.com/vladaman/n8n-nodes-zoho).
