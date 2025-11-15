# Contacts Module

> Person/individual management in Zoho Bigin

## 📋 Overview

Contacts represent individual people in your Bigin CRM. Each contact can be associated with an Account (company) and related to Pipelines, Tasks, and Events.

**API Module Name**: `Contacts`
**Priority**: High
**Estimated Effort**: 3-4 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/Contacts` |
| Get | GET | `/Contacts/{id}` |
| Create | POST | `/Contacts` |
| Update | PUT | `/Contacts` |
| Delete | DELETE | `/Contacts/{id}` |
| Search | GET | `/Contacts/search` |
| Bulk Create | POST | `/Contacts` (up to 100 records) |
| Bulk Update | PUT | `/Contacts` (up to 100 records) |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required | Notes |
|--------------|----------------|------|----------|-------|
| First Name | `First_Name` | string | No | - |
| Last Name | `Last_Name` | string | **Yes** | Required for create |
| Email | `Email` | email | No | Must be valid email format |
| Phone | `Phone` | phone | No | - |
| Mobile | `Mobile` | phone | No | - |
| Title | `Title` | string | No | Job title |
| Department | `Department` | string | No | - |
| Account Name | `Account_Name` | lookup | No | Related company: `{"id": "123"}` |
| Owner | `Owner` | lookup | Auto | Assigned user |
| Mailing Street | `Mailing_Street` | string | No | Address line 1 |
| Mailing City | `Mailing_City` | string | No | City |
| Mailing State | `Mailing_State` | string | No | State/Province |
| Mailing Zip | `Mailing_Zip` | string | No | Postal code |
| Mailing Country | `Mailing_Country` | string | No | Country |
| Description | `Description` | textarea | No | Notes |
| Secondary Email | `Secondary_Email` | email | No | Alternate email |

## 📥 Create Contact Example

**Request**:
```json
{
    "data": [
        {
            "First_Name": "John",
            "Last_Name": "Doe",
            "Email": "john.doe@example.com",
            "Phone": "+1-555-0123",
            "Mobile": "+1-555-0124",
            "Title": "Director of Sales",
            "Department": "Sales",
            "Account_Name": { "id": "4150868000000224003" },
            "Mailing_Street": "123 Main St",
            "Mailing_City": "San Francisco",
            "Mailing_State": "CA",
            "Mailing_Zip": "94105",
            "Mailing_Country": "USA"
        }
    ]
}
```

## 🔍 Common Filters

- `Email` - contains search
- `Phone` - contains search
- `Account_Name` - filter by account ID
- `Owner` - filter by owner ID
- `Created_Time` - date range
- `Modified_Time` - date range

### Example Search

```
# Find contacts by email domain
(Email:contains:@example.com)

# Contacts at specific company
(Account_Name:equals:4150868000000224003)

# Contacts without account
(Account_Name:is_empty)
```

## 🎨 n8n Implementation Notes

### Structured Input for Create

```typescript
{
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    default: '',
},
{
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    required: true,
    default: '',
},
{
    displayName: 'Email',
    name: 'email',
    type: 'string',
    default: '',
    placeholder: 'name@company.com',
},
{
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    default: '',
    description: 'ID of the related company/account',
},
```

### Map to API Format

```typescript
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
```

## ✅ Testing Checklist

- [ ] Create contact (minimum fields - last name only)
- [ ] Create contact with all fields
- [ ] Create with account association
- [ ] Email validation (invalid email format)
- [ ] Bulk create (multiple contacts)
- [ ] Update contact
- [ ] Search by email
- [ ] Filter by account
- [ ] Delete contact

## 🚨 Common Issues

1. **Last Name Required**: Must provide `Last_Name` for create
2. **Email Format**: Must be valid email or API returns error
3. **Duplicate Detection**: Bigin may flag duplicate emails
4. **Account Lookup**: Use `{"id": "123"}` format, not just string

---

**API Reference**: https://www.bigin.com/developer/docs/apis/v2/contacts-api.html
**Status**: 📝 Ready for Implementation
