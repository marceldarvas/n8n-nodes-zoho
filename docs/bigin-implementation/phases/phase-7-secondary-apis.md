# Phase 7: Secondary APIs & Advanced Operations

> Implement secondary REST API functions including Related Lists, Email, Files, Attachments, Photos, and Change Owner

## 📋 Overview

Phase 7 focuses on implementing secondary API functions that complement the core CRUD operations. These features enable advanced workflows including relationship navigation, email communication, file management, and record ownership transfers.

**Priority**: Medium-High (valuable for production workflows)
**Estimated Effort**: 12-16 hours
**Dependencies**: Phase 6 complete
**Blocks**: None

## 🎯 Objectives

1. 🔗 **Related Lists API** - Navigate relationships between records
2. 📧 **Send Emails** - Send emails from Bigin to record-associated addresses
3. 📁 **Files API** - Upload and download files for records
4. 📎 **Attachments API** - Manage attachments (list, upload, download, delete)
5. 📷 **Photos API** - Upload, download, and delete photos
6. 👤 **Change Owner** - Transfer record ownership
7. 📚 **Comprehensive Documentation** - Examples and use cases for all features

---

## Feature 1: Related Lists API

### Overview

Navigate relationships between modules to retrieve, update, and manage associated records.

### API Endpoints

```
GET /bigin/v2/{module}/{record_id}/{related_module}
PUT /bigin/v2/{module}/{record_id}/{related_module}
DELETE /bigin/v2/{module}/{record_id}/{related_module}/{related_record_id}
```

### Supported Relationships

| Parent Module | Related Modules |
|--------------|----------------|
| **Contacts** | Pipelines, Tasks, Events, Notes, Attachments, Emails, Calls, Activities |
| **Pipelines** | Products, Contacts, Tasks, Events, Notes, Attachments, Emails, Calls |
| **Accounts** | Contacts, Pipelines, Tasks, Events, Notes, Attachments, Emails, Calls |
| **Products** | Pipelines, Attachments |
| **Tasks** | Notes, Attachments |
| **Events** | Notes, Attachments |
| **Calls** | Notes |

### Operations to Implement

1. **Get Related Records**
   - Operation: `getRelatedRecords`
   - Returns: Array of related records
   - Supports: Pagination, filtering

2. **Update Related Records**
   - Operation: `updateRelatedRecords`
   - Updates: Multiple related records at once

3. **Delink Related Record**
   - Operation: `delinkRelatedRecord`
   - Removes: Association without deleting the record

### Implementation Example

```typescript
} else if (operation === 'getRelatedRecords') {
    const recordId = context.getNodeParameter('recordId', itemIndex) as string;
    const relatedList = context.getNodeParameter('relatedList', itemIndex) as string;
    const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;

    if (returnAll) {
        return await ZohoBigin.fetchAllPages(
            context,
            `/Contacts/${recordId}/${relatedList}`,
        );
    }

    const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
    const response = await zohoBiginApiRequest.call(
        context,
        'GET',
        `/Contacts/${recordId}/${relatedList}`,
        {},
        { page: 1, per_page: limit },
    );

    return response.data || [];
}
```

---

## Feature 2: Send Emails

### Overview

Send emails directly from Bigin to email addresses associated with records.

### API Endpoint

```
POST /bigin/v2/{module_api_name}/{record_id}/actions/send_mail
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| from | object | Yes | Sender email address and name |
| to | array | Yes | Recipient email addresses |
| cc | array | No | CC recipients |
| bcc | array | No | BCC recipients |
| org_email | boolean | No | Use organization email |
| subject | string | No | Email subject |
| content | string | No | Email body (HTML or plain text) |
| mail_format | string | No | Format: "html" or "text" |
| attachments | array | No | Array of attachment objects |

### Request Body Example

```json
{
  "from": {
    "user_name": "John Doe",
    "email": "john@company.com"
  },
  "to": [
    {
      "user_name": "Jane Smith",
      "email": "jane@client.com"
    }
  ],
  "cc": [],
  "bcc": [],
  "subject": "Follow-up on our conversation",
  "content": "<p>Hi Jane,</p><p>Following up on our discussion...</p>",
  "mail_format": "html",
  "org_email": false,
  "attachments": [
    {
      "id": "4876876000000624001"
    }
  ]
}
```

### Operations to Implement

**Send Email**
- Operation: `sendEmail`
- Resource: All main modules (Contact, Pipeline, Account)
- Supports: HTML/text formats, attachments, CC/BCC

### Parameter Definition

```typescript
{
    displayName: 'From Email',
    name: 'fromEmail',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['sendEmail'],
        },
    },
    default: '',
    placeholder: 'john@company.com',
    description: 'Sender email address',
},
{
    displayName: 'To Emails',
    name: 'toEmails',
    type: 'string',
    required: true,
    typeOptions: { multipleValues: true },
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['sendEmail'],
        },
    },
    default: [],
    placeholder: 'jane@client.com',
    description: 'Recipient email addresses (comma-separated)',
},
{
    displayName: 'Subject',
    name: 'subject',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['sendEmail'],
        },
    },
    default: '',
    description: 'Email subject line',
},
{
    displayName: 'Content',
    name: 'content',
    type: 'string',
    typeOptions: {
        rows: 10,
    },
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['sendEmail'],
        },
    },
    default: '',
    description: 'Email body content (HTML or plain text)',
},
{
    displayName: 'Mail Format',
    name: 'mailFormat',
    type: 'options',
    options: [
        { name: 'HTML', value: 'html' },
        { name: 'Plain Text', value: 'text' },
    ],
    default: 'html',
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['sendEmail'],
        },
    },
    description: 'Email format',
},
```

### Use Cases

1. **Follow-up Email After Meeting**
   - Send personalized follow-up to contact after event
   - Include meeting notes as attachment

2. **Deal Proposal Email**
   - Send proposal to all contacts in a deal
   - Attach product catalog and pricing

3. **Bulk Email Campaign**
   - Loop through contacts and send customized emails
   - Track email send status

---

## Feature 3: Files API

### Overview

Upload and download files associated with Bigin records (documents, images, videos, etc.).

### API Endpoints

```
POST /bigin/v2/{module}/{record_id}/files
GET /bigin/v2/{module}/{record_id}/files/{file_id}
DELETE /bigin/v2/{module}/{record_id}/files/{file_id}
```

### Operations to Implement

1. **Upload File**
   - Operation: `uploadFile`
   - Supports: All file types
   - Max size: Per Bigin limits

2. **Download File**
   - Operation: `downloadFile`
   - Returns: File binary data

3. **Delete File**
   - Operation: `deleteFile`
   - Removes: File from record

### Implementation Notes

- Use multipart/form-data for uploads
- Handle binary data for downloads
- Validate file types and sizes
- Support attaching uploaded files to records

---

## Feature 4: Attachments API

### Overview

Manage attachments for records - list, upload, download, and delete.

### API Endpoints

```
GET /bigin/v2/{module}/{record_id}/Attachments
POST /bigin/v2/{module}/{record_id}/Attachments
GET /bigin/v2/{module}/{record_id}/Attachments/{attachment_id}
DELETE /bigin/v2/{module}/{record_id}/Attachments/{attachment_id}
```

### Operations to Implement

1. **List Attachments**
   - Operation: `listAttachments`
   - Returns: Array of attachment metadata
   - Supports: Pagination

2. **Upload Attachment**
   - Operation: `uploadAttachment`
   - Supports: Multiple file types
   - Returns: Attachment ID

3. **Download Attachment**
   - Operation: `downloadAttachment`
   - Returns: File binary

4. **Delete Attachment**
   - Operation: `deleteAttachment`
   - Removes: Attachment from record

### Parameter Definition

```typescript
{
    displayName: 'Attachment File',
    name: 'attachmentFile',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['uploadAttachment'],
        },
    },
    default: '',
    description: 'Binary data or file path to upload',
    placeholder: 'binary:data or /path/to/file.pdf',
},
{
    displayName: 'Attachment ID',
    name: 'attachmentId',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account'],
            operation: ['downloadAttachment', 'deleteAttachment'],
        },
    },
    default: '',
    description: 'ID of the attachment',
},
```

### Use Cases

1. **Contract Management**
   - Upload signed contracts to deal records
   - Download for review or archival

2. **Document Storage**
   - Attach product specs to product records
   - Store company documents on account records

3. **Proposal Tracking**
   - Upload proposals to pipeline
   - Track versions and modifications

---

## Feature 5: Photos API

### Overview

Upload, download, and delete photos for records (profile pictures, product images, etc.).

### API Endpoints

```
POST /bigin/v2/{module}/{record_id}/photo
GET /bigin/v2/{module}/{record_id}/photo
DELETE /bigin/v2/{module}/{record_id}/photo
```

### Operations to Implement

1. **Upload Photo**
   - Operation: `uploadPhoto`
   - Supports: JPG, PNG, GIF
   - Max size: Per Bigin limits

2. **Download Photo**
   - Operation: `downloadPhoto`
   - Returns: Image binary

3. **Delete Photo**
   - Operation: `deletePhoto`
   - Removes: Photo from record

### Parameter Definition

```typescript
{
    displayName: 'Photo File',
    name: 'photoFile',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'account', 'product'],
            operation: ['uploadPhoto'],
        },
    },
    default: '',
    description: 'Binary image data or file path',
    placeholder: 'binary:data or /path/to/photo.jpg',
},
```

### Use Cases

1. **Contact Profile Pictures**
   - Upload profile photos for contacts
   - Display in CRM interface

2. **Product Images**
   - Add product photos to product records
   - Use in proposals and catalogs

3. **Company Logos**
   - Upload company logos to account records
   - Display in reports and dashboards

---

## Feature 6: Change Owner

### Overview

Transfer ownership of records from one user to another.

### API Endpoint

```
POST /bigin/v2/{module_api_name}/actions/change_owner
```

### Request Body Example

```json
{
  "owner": "4876876000000225001",
  "ids": [
    "4876876000000624001",
    "4876876000000624002",
    "4876876000000624003"
  ]
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| owner | string | Yes | ID of the new owner (user ID) |
| ids | array | Yes | Array of record IDs to transfer |

### Operations to Implement

**Change Owner**
- Operation: `changeOwner`
- Resource: All main modules
- Supports: Single or bulk ownership transfer

### Parameter Definition

```typescript
{
    displayName: 'New Owner ID',
    name: 'newOwnerId',
    type: 'string',
    required: true,
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account', 'product'],
            operation: ['changeOwner'],
        },
    },
    default: '',
    description: 'User ID of the new owner',
    placeholder: '4876876000000225001',
},
{
    displayName: 'Record IDs',
    name: 'recordIds',
    type: 'string',
    required: true,
    typeOptions: { multipleValues: true },
    displayOptions: {
        show: {
            resource: ['contact', 'pipeline', 'account', 'product'],
            operation: ['changeOwner'],
        },
    },
    default: [],
    description: 'IDs of records to transfer (comma-separated for bulk)',
    placeholder: '4876876000000624001,4876876000000624002',
},
```

### Implementation Example

```typescript
} else if (operation === 'changeOwner') {
    const newOwnerId = context.getNodeParameter('newOwnerId', itemIndex) as string;
    const recordIdsRaw = context.getNodeParameter('recordIds', itemIndex) as string;

    // Parse comma-separated IDs
    const recordIds = recordIdsRaw.split(',').map(id => id.trim());

    const body = {
        owner: newOwnerId,
        ids: recordIds,
    };

    const response = await zohoBiginApiRequest.call(
        context,
        'POST',
        '/Contacts/actions/change_owner',
        body,
        {},
    );

    return response.data || [];
}
```

### Use Cases

1. **Employee Departure**
   - Transfer all records from departing employee to replacement
   - Bulk transfer in single operation

2. **Territory Reassignment**
   - Move accounts to new territory owner
   - Transfer associated contacts and deals

3. **Load Balancing**
   - Redistribute records among team members
   - Balance workload based on capacity

---

## 📋 Implementation Priority

Recommended order based on value and dependencies:

1. **Related Lists API** (High value, enables relationship navigation)
2. **Attachments API** (High value, commonly used)
3. **Send Emails** (High value, communication critical)
4. **Change Owner** (Medium value, admin/management function)
5. **Photos API** (Medium value, enhances UI)
6. **Files API** (Medium value, overlaps with attachments)

---

## 🛠️ Technical Considerations

### Binary Data Handling

For file uploads (Files, Attachments, Photos):

```typescript
// Accept binary data from previous node
const binaryData = this.helpers.assertBinaryData(itemIndex, 'data');
const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, 'data');

// Or accept file path
const filePath = context.getNodeParameter('filePath', itemIndex) as string;
const fileBuffer = await fs.promises.readFile(filePath);

// Create form data
const formData = new FormData();
formData.append('file', fileBuffer, {
    filename: binaryData.fileName,
    contentType: binaryData.mimeType,
});
```

### Error Handling

- **File Size Limits**: Validate before upload
- **Permission Errors**: Handle insufficient permissions for ownership transfer
- **Email Validation**: Validate email addresses before sending
- **Attachment Not Found**: Handle missing attachment IDs gracefully
- **Network Timeouts**: Handle large file uploads with appropriate timeouts

### Performance

- **Batch Operations**: Group ownership transfers when possible
- **Streaming Downloads**: Stream large files instead of loading into memory
- **Progress Tracking**: Provide feedback for long-running uploads
- **Rate Limiting**: Respect API limits for email sending

### Caching

- **Attachment Metadata**: Cache attachment lists for records
- **User IDs**: Cache user ID mappings for ownership transfers
- **Email Templates**: Consider caching common email templates

---

## 📚 Documentation Updates

### User Documentation (docs/Bigin.md)

Add comprehensive sections for each feature:

#### Related Lists Section
```markdown
## Related Lists

Navigate relationships between records to access associated data.

### Get All Deals for a Contact

**Operation**: Get Related Records
- Record ID: Contact ID
- Related List: Pipelines
- Return All: true

Returns all pipeline (deal) records associated with the contact.

### Get Products in a Deal

**Operation**: Get Related Records
- Record ID: Pipeline ID
- Related List: Products

Returns product line items in the deal.
```

#### Send Emails Section
```markdown
## Send Emails

Send emails from Bigin to record-associated email addresses.

### Send Follow-up Email

**Operation**: Send Email
- Record ID: Contact ID
- From: your.email@company.com
- To: contact.email@client.com
- Subject: "Follow-up on our meeting"
- Content: HTML email body
- Attachments: Optional

Sends email and logs in Bigin activity history.
```

#### Attachments Section
```markdown
## Manage Attachments

Upload, download, and manage file attachments for records.

### Upload Contract to Deal

**Operation**: Upload Attachment
- Record ID: Pipeline ID
- File: Binary data from previous node or file path

Uploads file and associates with the deal record.

### Download Attachment

**Operation**: Download Attachment
- Record ID: Pipeline ID
- Attachment ID: Attachment to download

Returns binary file data for saving or processing.
```

---

## ✅ Acceptance Criteria

### Feature Completion
- [x] All 6 features documented
- [ ] Related Lists: Get, Update, Delink operations
- [ ] Send Emails: All parameters, HTML/text support
- [ ] Files API: Upload, download, delete
- [ ] Attachments API: List, upload, download, delete
- [ ] Photos API: Upload, download, delete
- [ ] Change Owner: Single and bulk transfer

### Quality Standards
- [ ] Binary data handling implemented correctly
- [ ] Error handling for all edge cases
- [ ] Pagination support where applicable
- [ ] Rate limiting respected
- [ ] Documentation complete with examples
- [ ] Tested with real API calls
- [ ] No performance degradation

---

## 🧪 Testing Checklist

### Related Lists
- [ ] Get Pipelines for Contact
- [ ] Get Products for Pipeline
- [ ] Get Contacts for Account
- [ ] Update related records
- [ ] Delink contact from pipeline
- [ ] Test pagination with Return All

### Send Emails
- [ ] Send HTML email
- [ ] Send plain text email
- [ ] Send with CC/BCC
- [ ] Send with attachments
- [ ] Test email validation
- [ ] Test with invalid recipient

### Attachments
- [ ] List attachments for record
- [ ] Upload PDF attachment
- [ ] Upload image attachment
- [ ] Download attachment
- [ ] Delete attachment
- [ ] Test with large files

### Photos
- [ ] Upload contact photo
- [ ] Upload product image
- [ ] Download photo
- [ ] Delete photo
- [ ] Test image format validation

### Change Owner
- [ ] Transfer single record
- [ ] Bulk transfer multiple records
- [ ] Test with invalid user ID
- [ ] Test with insufficient permissions

---

## 📦 Files to Modify

### Description Files
- `nodes/descriptions/BiginContactsDescription.ts`
- `nodes/descriptions/BiginPipelinesDescription.ts`
- `nodes/descriptions/BiginAccountsDescription.ts`
- `nodes/descriptions/BiginProductsDescription.ts`
- `nodes/descriptions/BiginTasksDescription.ts`
- `nodes/descriptions/BiginEventsDescription.ts`

### Main Node File
- `nodes/ZohoBigin.node.ts` - Add handler methods for all new operations

### Helper Functions
- Consider adding `GenericFunctions.ts` helpers for:
  - Binary data handling
  - Form data creation
  - Email validation
  - File type validation

### Documentation
- `docs/Bigin.md` - Add sections for all 6 features

---

## 🔮 Future Enhancements (Phase 8+)

Consider for later phases:

1. **Email Templates**: Pre-defined email templates
2. **Email Tracking**: Track opens, clicks, bounces
3. **File Versioning**: Track file version history
4. **Attachment Tags**: Categorize attachments
5. **Batch Email**: Send bulk emails with merge fields
6. **Folder Organization**: Organize files in folders
7. **Access Control**: Fine-grained permissions for files
8. **Thumbnail Generation**: Auto-generate thumbnails for images
9. **Document Conversion**: Convert documents between formats
10. **Ownership History**: Track ownership changes over time

---

## 🎓 Learning Resources

### API Overview & Getting Started
- [Bigin API v2 Overview](https://www.bigin.com/developer/docs/apis/v2/) - Main API documentation hub
- [OAuth 2.0 Overview](https://www.bigin.com/developer/docs/apis/v2/oauth-overview.html) - Authentication mechanism
- [Get Started with Bigin APIs in Postman](https://www.bigin.com/developer/docs/apis/v2/bigin-apis-postman.html) - Quick start guide
- [What's New in Bigin API V2](https://www.bigin.com/developer/docs/apis/v2/whats-new.html) - Latest updates and changes
- [API Changelog](https://www.bigin.com/developer/docs/apis/v2/api-changelog.html) - Version history

### Related Lists APIs
- [Related List Metadata API](https://www.bigin.com/developer/docs/apis/v2/related-list-meta.html) - Get available related lists for a module
- [Get Related Records API](https://www.bigin.com/developer/docs/apis/v2/get-related-records.html) - Retrieve related records
- [Update Related Records API](https://www.bigin.com/developer/docs/apis/v2/update-related-records.html) - Update up to 100 related records per call
- [Delink Related Records API](https://www.bigin.com/developer/docs/apis/delink.html) - Remove associations (up to 100 per call)

### Send Email API
- [Send Mail API](https://www.bigin.com/developer/docs/apis/v2/send-mail.html) - Send emails from Bigin to record-associated addresses
- [Get Configured From-Addresses API](https://www.bigin.com/developer/docs/apis/v2/get-from-addresses.html) - Get available sender addresses

### Files & Attachments APIs
- [Upload Files API](https://www.bigin.com/developer/docs/apis/v2/upload-files.html) - Upload files to records (documents, images, videos)
- [Get Files API](https://www.bigin.com/developer/docs/apis/v2/get-files.html) - Download files using encrypted file ID
- [Get Attachments API](https://www.bigin.com/developer/docs/apis/v2/get-attachments.html) - List attachments for a record
- [Upload Attachment API](https://www.bigin.com/developer/docs/apis/v2/upload-attachment.html) - Add attachments to records
- [Download Attachment API](https://www.bigin.com/developer/docs/apis/download-attachments.html) - Download attachment by ID (v1)
- [Delete Attachments API](https://www.bigin.com/developer/docs/apis/delete-attachments.html) - Remove attachments (v1)

### Photos API
- [Upload Profile Photo API](https://www.bigin.com/developer/docs/apis/v2/upload-image.html) - Add profile photos (max 10MB, 10MP)
- [Download Profile Photo API](https://www.bigin.com/developer/docs/apis/v2/download-image.html) - Download record photos
- [Delete Profile Photo API](https://www.bigin.com/developer/docs/apis/v2/delete-image.html) - Remove profile photos
- [Upload Organization Photo API](https://www.bigin.com/developer/docs/apis/v2/upload-org-img.html) - Organization branding (max 1MB)

### Change Owner API
- [Change Record Owner API](https://www.bigin.com/developer/docs/apis/v2/change-record-owner.html) - Transfer ownership (up to 500 records per call)

### Additional References
- [API Methods (JavaScript SDK)](https://www.bigin.com/developer/docs/sdks/api-js-sdk.html) - SDK for browser-based integrations
- [Get Modules API](https://www.bigin.com/developer/docs/apis/v2/modules-api.html) - Module metadata and configuration
- [Field Meta Data API](https://www.bigin.com/developer/docs/apis/v2/field-meta.html) - Field definitions for modules

### n8n Resources
- [n8n Binary Data Handling](https://docs.n8n.io/code-examples/methods-and-variables/binary-data/) - Working with files in n8n

### Important Notes
- **API Versioning**: Some endpoints (Delete Attachments, Download Attachments, Delink) may still use v1 endpoints. Check documentation for latest versions.
- **Rate Limits**: Maximum batch sizes vary by operation (100 for related records, 500 for ownership transfers)
- **File Sizes**: Photos limited to 10MB/10MP, organization photos to 1MB
- **Authentication**: All endpoints require OAuth 2.0 access tokens with appropriate scopes

---

**Previous Phase**: [Phase 6: Advanced Features](./phase-6-advanced-features.md)

**Status**: 📝 **Planned** - Not Started

**Estimated Version**: 1.5 (Secondary APIs Complete)

**Estimated Lines of Code**: ~1,500-2,000 (including handlers, descriptions, docs)

**Note**: This phase significantly expands the Bigin node's capabilities beyond basic CRUD, enabling advanced workflows including email communication, file management, relationship navigation, and administrative functions. These features are essential for production-ready CRM automation.
