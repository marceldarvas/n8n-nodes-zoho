# Notes Module

> Notes and annotations for records in Zoho Bigin

## 📋 Overview

Notes allow you to add text annotations to any record in Bigin (Contacts, Accounts, Pipelines, Products). Notes are attached to a parent record.

**API Module Name**: `Notes`
**Priority**: Lower
**Estimated Effort**: 2-3 hours

## 🔧 API Endpoints

| Operation | Method | Endpoint |
|-----------|--------|----------|
| List | GET | `/{ParentModule}/{parent_id}/Notes` |
| Get | GET | `/Notes/{id}` |
| Create | POST | `/{ParentModule}/{parent_id}/Notes` |
| Update | PUT | `/Notes` |
| Delete | DELETE | `/Notes/{id}` |

## 📝 Key Fields

| Display Name | API Field Name | Type | Required |
|--------------|----------------|------|----------|
| Note Title | `Note_Title` | string | No |
| Note Content | `Note_Content` | text | **Yes** |
| Parent Module | - | - | **Yes** (in URL) |
| Parent ID | - | - | **Yes** (in URL) |
| Owner | `Owner` | lookup | Auto |

## 📥 Create Note Example

**Endpoint**: `POST /bigin/v2/Contacts/4150868000000224005/Notes`

```json
{
    "data": [
        {
            "Note_Title": "Initial call notes",
            "Note_Content": "Spoke with contact about their requirements. They are interested in the enterprise plan and need a demo scheduled for next week."
        }
    ]
}
```

## 📋 List Notes for a Record

**Endpoint**: `GET /bigin/v2/Pipelines/4150868000000225013/Notes`

**Response**:
```json
{
    "data": [
        {
            "Owner": { "name": "John Sales", "id": "..." },
            "Modified_Time": "2025-01-22T10:15:00+00:00",
            "Created_Time": "2025-01-22T10:15:00+00:00",
            "Parent_Id": {
                "name": "Acme Enterprise License",
                "id": "4150868000000225013"
            },
            "$se_module": "Pipelines",
            "id": "4150868000000226001",
            "Note_Title": "Proposal sent",
            "Note_Content": "Sent proposal via email. Waiting for feedback."
        }
    ]
}
```

## 🎨 n8n Implementation Notes

### Parameters Needed

```typescript
{
    displayName: 'Parent Module',
    name: 'parentModule',
    type: 'options',
    options: [
        { name: 'Contact', value: 'Contacts' },
        { name: 'Account', value: 'Accounts' },
        { name: 'Pipeline', value: 'Pipelines' },
        { name: 'Product', value: 'Products' },
    ],
    required: true,
},
{
    displayName: 'Parent Record ID',
    name: 'parentId',
    type: 'string',
    required: true,
},
{
    displayName: 'Note Content',
    name: 'noteContent',
    type: 'string',
    typeOptions: { rows: 4 },
    required: true,
},
{
    displayName: 'Note Title',
    name: 'noteTitle',
    type: 'string',
    default: '',
},
```

### Handler Implementation

```typescript
if (operation === 'createNote') {
    const parentModule = this.getNodeParameter('parentModule', itemIndex) as string;
    const parentId = this.getNodeParameter('parentId', itemIndex) as string;
    const noteContent = this.getNodeParameter('noteContent', itemIndex) as string;
    const noteTitle = this.getNodeParameter('noteTitle', itemIndex, '') as string;

    const body = {
        data: [
            {
                Note_Content: noteContent,
                ...(noteTitle && { Note_Title: noteTitle }),
            },
        ],
    };

    const response = await zohoBiginApiRequest.call(
        this,
        'POST',
        `/${parentModule}/${parentId}/Notes`,
        body,
        {},
    );

    return response.data?.[0]?.details || {};
}
```

## ✅ Testing Checklist

- [ ] Create note for contact
- [ ] Create note for pipeline
- [ ] List notes for record
- [ ] Get specific note
- [ ] Update note content
- [ ] Delete note
- [ ] Note without title (content only)

## 🚨 Common Issues

1. **Parent Module Required**: Must specify which module the note belongs to
2. **Parent ID Required**: Must provide valid parent record ID
3. **URL Structure**: Endpoint includes parent module and ID
4. **Content Required**: Note_Content is required, Note_Title is optional

---

## 📚 Related Resources

### Bigin API v2 Documentation
- **Get Notes API**: https://www.bigin.com/developer/docs/apis/v2/get-notes.html - Retrieve note records
- **Insert Records API**: https://www.bigin.com/developer/docs/apis/v2/insert-records.html - Create new notes
- **Update Records API**: https://www.bigin.com/developer/docs/apis/v2/update-records.html - Update note data
- **Delete Records API**: https://www.bigin.com/developer/docs/apis/v2/delete-records.html - Delete notes
- **Field Meta Data API**: https://www.bigin.com/developer/docs/apis/v2/field-meta.html - Get field definitions

---

**Status**: 📝 Ready for Implementation
