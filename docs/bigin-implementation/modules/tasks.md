# Tasks Module

> Task management and to-do items in Zoho Bigin

## 📋 Overview

Tasks represent action items and to-dos. Tasks can be related to Contacts, Accounts, or Pipelines.

**API Module Name**: `Tasks`
**Priority**: Medium
**Estimated Effort**: 2-3 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/Tasks` |
| Get | GET | `/Tasks/{id}` |
| Create | POST | `/Tasks` |
| Update | PUT | `/Tasks` |
| Delete | DELETE | `/Tasks/{id}` |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required |
|--------------|----------------|------|----------|
| Subject | `Subject` | string | **Yes** |
| Due Date | `Due_Date` | date | No |
| Priority | `Priority` | picklist | No |
| Status | `Status` | picklist | No |
| Related To | `$se_module` | string | No |
| What Id | `What_Id` | lookup | No |
| Owner | `Owner` | lookup | Auto |
| Description | `Description` | textarea | No |
| Reminder | `Remind_At` | datetime | No |

## 📝 Priority Values

- High
- Highest
- Low
- Lowest
- Normal (default)

## 📝 Status Values

- Not Started (default)
- Deferred
- In Progress
- Completed
- Waiting for input

## 📥 Create Task Example

```json
{
    "data": [
        {
            "Subject": "Follow up on proposal",
            "Due_Date": "2025-02-01",
            "Priority": "High",
            "Status": "Not Started",
            "$se_module": "Pipelines",
            "What_Id": {
                "id": "4150868000000225013"
            },
            "Description": "Send follow-up email regarding proposal sent last week",
            "Remind_At": "2025-02-01T09:00:00+00:00"
        }
    ]
}
```

## 🔗 Relating Tasks to Other Modules

```json
// Related to Contact
{
    "$se_module": "Contacts",
    "What_Id": { "id": "contact_id" }
}

// Related to Account
{
    "$se_module": "Accounts",
    "What_Id": { "id": "account_id" }
}

// Related to Pipeline
{
    "$se_module": "Pipelines",
    "What_Id": { "id": "pipeline_id" }
}
```

## ✅ Testing Checklist

- [ ] Create task (subject only)
- [ ] Create with due date and reminder
- [ ] Relate to contact
- [ ] Relate to pipeline
- [ ] Mark as complete
- [ ] Filter by status
- [ ] Filter by due date

---

**Status**: 📝 Ready for Implementation
