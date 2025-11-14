# Events Module

> Calendar event management in Zoho Bigin

## 📋 Overview

Events represent calendar appointments, meetings, and scheduled activities. Events can be related to Contacts, Accounts, or Pipelines.

**API Module Name**: `Events`
**Priority**: Medium
**Estimated Effort**: 2-3 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/Events` |
| Get | GET | `/Events/{id}` |
| Create | POST | `/Events` |
| Update | PUT | `/Events` |
| Delete | DELETE | `/Events/{id}` |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required |
|--------------|----------------|------|----------|
| Title | `Event_Title` | string | **Yes** |
| Start DateTime | `Start_DateTime` | datetime | **Yes** |
| End DateTime | `End_DateTime` | datetime | **Yes** |
| All Day Event | `All_day` | boolean | No |
| Location | `Venue` | string | No |
| Participants | `Participants` | lookup[] | No |
| Related To | `$se_module` | string | No |
| What Id | `What_Id` | lookup | No |
| Description | `Description` | textarea | No |
| Reminder | `Remind_At` | string | No |
| Owner | `Owner` | lookup | Auto |

## 📥 Create Event Example

```json
{
    "data": [
        {
            "Event_Title": "Product Demo Meeting",
            "Start_DateTime": "2025-02-05T14:00:00+00:00",
            "End_DateTime": "2025-02-05T15:00:00+00:00",
            "All_day": false,
            "Venue": "Zoom Meeting",
            "$se_module": "Pipelines",
            "What_Id": {
                "id": "4150868000000225013"
            },
            "Participants": [
                { "id": "contact_id_1" },
                { "id": "contact_id_2" }
            ],
            "Description": "Demo of enterprise features",
            "Remind_At": "15 minutes before"
        }
    ]
}
```

## ⏰ Reminder Options

- None
- 5 minutes before
- 15 minutes before
- 30 minutes before
- 1 hour before
- 1 day before

## 🔍 Common Filters

- `Start_DateTime` - date range
- `Owner` - assigned user
- `$se_module` - related module

## ✅ Testing Checklist

- [ ] Create event (basic)
- [ ] Create all-day event
- [ ] Add participants
- [ ] Relate to pipeline
- [ ] Set reminder
- [ ] Update event time
- [ ] Delete event

---

**Status**: 📝 Ready for Implementation
