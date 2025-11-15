# Accounts Module

> Company/organization management in Zoho Bigin

## 📋 Overview

Accounts represent companies or organizations. In Bigin's UI, these are called "Companies" but the API uses "Accounts". Multiple Contacts can be associated with an Account, and Pipelines can be linked to Accounts.

**API Module Name**: `Accounts`
**UI Name**: Companies
**Priority**: High
**Estimated Effort**: 3-4 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/Accounts` |
| Get | GET | `/Accounts/{id}` |
| Create | POST | `/Accounts` |
| Update | PUT | `/Accounts` |
| Delete | DELETE | `/Accounts/{id}` |
| Search | GET | `/Accounts/search` |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required |
|--------------|----------------|------|----------|
| Account Name | `Account_Name` | string | **Yes** |
| Website | `Website` | url | No |
| Phone | `Phone` | phone | No |
| Industry | `Industry` | picklist | No |
| No of Employees | `Employees` | number | No |
| Annual Revenue | `Annual_Revenue` | currency | No |
| Account Type | `Account_Type` | picklist | No |
| Owner | `Owner` | lookup | Auto |
| Parent Account | `Parent_Account` | lookup | No |
| Billing Street | `Billing_Street` | string | No |
| Billing City | `Billing_City` | string | No |
| Billing State | `Billing_State` | string | No |
| Billing Code | `Billing_Code` | string | No |
| Billing Country | `Billing_Country` | string | No |
| Shipping Street | `Shipping_Street` | string | No |
| Shipping City | `Shipping_City` | string | No |
| Shipping State | `Shipping_State` | string | No |
| Shipping Code | `Shipping_Code` | string | No |
| Shipping Country | `Shipping_Country` | string | No |
| Description | `Description` | textarea | No |

## 📥 Create Account Example

**Request**:
```json
{
    "data": [
        {
            "Account_Name": "Acme Corporation",
            "Website": "https://www.acme.com",
            "Phone": "+1-555-0100",
            "Industry": "Technology",
            "Employees": 500,
            "Annual_Revenue": 5000000,
            "Billing_Street": "100 Tech Blvd",
            "Billing_City": "San Francisco",
            "Billing_State": "CA",
            "Billing_Code": "94105",
            "Billing_Country": "USA"
        }
    ]
}
```

## 🔍 Industry Picklist Values

Common industry values (customize in Bigin settings):
- Technology
- Healthcare
- Finance
- Manufacturing
- Retail
- Education
- Consulting
- Real Estate

## 🎨 Parent-Child Relationships

Accounts can have hierarchical relationships:

```json
{
    "Account_Name": "Acme Corp - West Region",
    "Parent_Account": {
        "id": "4150868000000224003"  // ID of parent account
    }
}
```

## ✅ Testing Checklist

- [ ] Create account (name only)
- [ ] Create with all fields
- [ ] Create with parent account
- [ ] Website URL validation
- [ ] Update account
- [ ] Search by name
- [ ] Filter by industry
- [ ] Delete account (check for related contacts/pipelines)

## 🚨 Common Issues

1. **Account Name Required**: Must provide for create
2. **Website Format**: Must be valid URL (http:// or https://)
3. **Parent Account**: Must exist before setting as parent
4. **Cannot Delete**: If account has related contacts/pipelines

---

**API Reference**: https://www.bigin.com/developer/docs/apis/v2/accounts-api.html
**Status**: 📝 Ready for Implementation
