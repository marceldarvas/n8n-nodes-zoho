import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const contactsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['contact'] },
		},
		options: [
			{ name: 'List', value: 'listContacts', description: 'List all contacts' },
			{ name: 'Get', value: 'getContact', description: 'Get a contact' },
			{ name: 'Create', value: 'createContact', description: 'Create a contact' },
			{ name: 'Update', value: 'updateContact', description: 'Update a contact' },
			{ name: 'Upsert', value: 'upsertContact', description: 'Create or update a contact (idempotent)' },
			{ name: 'Delete', value: 'deleteContact', description: 'Delete a contact' },
			{ name: 'Search', value: 'searchContacts', description: 'Search contacts' },
			{ name: 'Get Fields', value: 'getFields', description: 'Get metadata for contact fields' },
			{ name: 'Bulk Create', value: 'bulkCreateContacts', description: 'Create multiple contacts' },
			{ name: 'Bulk Update', value: 'bulkUpdateContacts', description: 'Update multiple contacts' },
			{ name: 'Get Related Records', value: 'getRelatedRecords', description: 'Get records related to a contact' },
			{ name: 'Update Related Records', value: 'updateRelatedRecords', description: 'Update related records' },
			{ name: 'Delink Related Record', value: 'delinkRelatedRecord', description: 'Remove association with a related record' },
			{ name: 'Send Email', value: 'sendEmail', description: 'Send an email from Bigin' },
			{ name: 'List Attachments', value: 'listAttachments', description: 'List all attachments for a contact' },
			{ name: 'Upload Attachment', value: 'uploadAttachment', description: 'Upload an attachment to a contact' },
			{ name: 'Download Attachment', value: 'downloadAttachment', description: 'Download an attachment' },
			{ name: 'Delete Attachment', value: 'deleteAttachment', description: 'Delete an attachment' },
			{ name: 'Upload Photo', value: 'uploadPhoto', description: 'Upload a profile photo' },
			{ name: 'Download Photo', value: 'downloadPhoto', description: 'Download profile photo' },
			{ name: 'Delete Photo', value: 'deletePhoto', description: 'Delete profile photo' },
			{ name: 'Change Owner', value: 'changeOwner', description: 'Transfer record ownership' },
		],
		default: 'listContacts',
	},
];

export const contactsFields: INodeProperties[] = [
	// Pagination
	...paginationFields('contact', 'listContacts'),

	// Contact ID (for get, update, delete)
	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getContact', 'updateContact', 'deleteContact'],
			},
		},
		default: '',
		description: 'ID of the contact',
	},

	// Create - Last Name (required)
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact'],
			},
		},
		default: '',
		description: 'Last name of the contact (required)',
	},

	// Create/Update/Upsert - Additional Fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact', 'updateContact', 'upsertContact'],
			},
		},
		options: [
			{
				displayName: 'First Name',
				name: 'First_Name',
				type: 'string',
				default: '',
				description: 'First name of the contact',
			},
			{
				displayName: 'Email',
				name: 'Email',
				type: 'string',
				default: '',
				placeholder: 'name@company.com',
				description: 'Email address of the contact',
			},
			{
				displayName: 'Phone',
				name: 'Phone',
				type: 'string',
				default: '',
				description: 'Phone number of the contact',
			},
			{
				displayName: 'Mobile',
				name: 'Mobile',
				type: 'string',
				default: '',
				description: 'Mobile number of the contact',
			},
			{
				displayName: 'Title',
				name: 'Title',
				type: 'string',
				default: '',
				description: 'Job title of the contact',
			},
			{
				displayName: 'Department',
				name: 'Department',
				type: 'string',
				default: '',
				description: 'Department where the contact works',
			},
			{
				displayName: 'Account ID',
				name: 'Account_Name',
				type: 'string',
				default: '',
				description: 'ID of the related account/company (use format: {"id": "account_id"})',
				placeholder: '{"id": "4150868000000224003"}',
			},
			{
				displayName: 'Secondary Email',
				name: 'Secondary_Email',
				type: 'string',
				default: '',
				description: 'Alternate email address',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the contact',
			},
		],
	},

	// Mailing Address
	{
		displayName: 'Mailing Address',
		name: 'mailingAddress',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Mailing Address',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact', 'updateContact', 'upsertContact'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{
						displayName: 'Street',
						name: 'Mailing_Street',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'City',
						name: 'Mailing_City',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'State',
						name: 'Mailing_State',
						type: 'string',
						default: '',
						description: 'State or province',
					},
					{
						displayName: 'Zip',
						name: 'Mailing_Zip',
						type: 'string',
						default: '',
						description: 'ZIP or postal code',
					},
					{
						displayName: 'Country',
						name: 'Mailing_Country',
						type: 'string',
						default: '',
						description: 'Country',
					},
				],
			},
		],
	},

	// GDPR Compliance - Data Processing Basis Details
	{
		displayName: 'GDPR Compliance',
		name: 'gdprCompliance',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add GDPR Data Processing Basis',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact', 'updateContact', 'upsertContact'],
			},
		},
		description: 'GDPR data processing basis details for this contact (EU compliance)',
		options: [
			{
				displayName: 'Data Processing Details',
				name: 'dataProcessingDetails',
				values: [
					{
						displayName: 'Data Processing Basis',
						name: 'Data_Processing_Basis',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getDataProcessingBasisOptions',
						},
						default: '',
						description: 'Legal basis for processing personal data (GDPR Article 6)',
					},
					{
						displayName: 'Contact Through Email',
						name: 'Contact_Through_Email',
						type: 'boolean',
						default: false,
						description: 'Whether contact can be reached via email',
					},
					{
						displayName: 'Contact Through Phone',
						name: 'Contact_Through_Phone',
						type: 'boolean',
						default: false,
						description: 'Whether contact can be reached via phone',
					},
					{
						displayName: 'Contact Through Survey',
						name: 'Contact_Through_Survey',
						type: 'boolean',
						default: false,
						description: 'Whether contact can be reached via survey',
					},
					{
						displayName: 'Lawful Reason',
						name: 'Lawful_Reason',
						type: 'string',
						default: '',
						description: 'Additional lawful reason for data processing',
					},
					{
						displayName: 'Consent Remarks',
						name: 'Consent_Remarks',
						type: 'string',
						typeOptions: {
							rows: 3,
						},
						default: '',
						description: 'Additional remarks about consent',
					},
					{
						displayName: 'Consent Date',
						name: 'Consent_Date',
						type: 'dateTime',
						default: '',
						description: 'Date when consent was obtained (ISO 8601 format)',
					},
				],
			},
		],
	},

	// ========================================
	// Upsert Operation Parameters
	// ========================================
	// Upsert - Last Name (required)
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['upsertContact'],
			},
		},
		default: '',
		description: 'Last name of the contact (required for upsert)',
	},

	// Upsert - Duplicate Check Fields
	{
		displayName: 'Duplicate Check Fields',
		name: 'duplicateCheckFields',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['upsertContact'],
			},
		},
		options: [
			{ name: 'Email', value: 'Email' },
			{ name: 'Phone', value: 'Phone' },
			{ name: 'Mobile', value: 'Mobile' },
			{ name: 'Last Name', value: 'Last_Name' },
			{ name: 'First Name + Last Name', value: 'First_Name,Last_Name' },
		],
		default: ['Email'],
		description: 'Fields to use for duplicate detection. If a record with matching values exists, it will be updated; otherwise, a new record will be created.',
	},

	// Filters for list/search
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Filter',
		default: { filter: [] },
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['listContacts', 'searchContacts'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Field',
						name: 'field',
						type: 'options',
						options: [
							{ name: 'Email', value: 'Email' },
							{ name: 'Phone', value: 'Phone' },
							{ name: 'Account Name', value: 'Account_Name' },
							{ name: 'Owner', value: 'Owner' },
							{ name: 'Created Time', value: 'Created_Time' },
							{ name: 'Modified Time', value: 'Modified_Time' },
						],
						default: 'Email',
						description: 'Field to filter by',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{ name: 'Equals', value: 'equals' },
							{ name: 'Not Equals', value: 'not_equals' },
							{ name: 'Contains', value: 'contains' },
							{ name: 'Does Not Contain', value: 'not_contains' },
							{ name: 'Starts With', value: 'starts_with' },
							{ name: 'Ends With', value: 'ends_with' },
							{ name: 'Greater Than', value: 'greater_than' },
							{ name: 'Less Than', value: 'less_than' },
							{ name: 'Between', value: 'between' },
							{ name: 'In', value: 'in' },
							{ name: 'Is Empty', value: 'is_empty' },
							{ name: 'Is Not Empty', value: 'is_not_empty' },
						],
						default: 'contains',
						description: 'Filter operator',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to filter by. For "between", use comma-separated values (e.g., "1000,5000"). For "in", use comma-separated values (e.g., "value1,value2,value3")',
						displayOptions: {
							show: {
								operator: ['equals', 'not_equals', 'contains', 'not_contains', 'starts_with', 'ends_with', 'greater_than', 'less_than', 'between', 'in'],
							},
						},
					},
				],
			},
		],
	},

	// Bulk operations - Contacts Data (JSON)
	{
		displayName: 'Contacts Data',
		name: 'contactsData',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['bulkCreateContacts', 'bulkUpdateContacts'],
			},
		},
		description: 'Array of contact objects (max 100)',
		placeholder: '[{"Last_Name": "Doe", "Email": "john@example.com"}, {"Last_Name": "Smith", "Email": "jane@example.com"}]',
	},

	// ========================================
	// Related Lists Operations
	// ========================================
	{
		displayName: 'Contact ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord', 'sendEmail', 'listAttachments', 'uploadAttachment', 'uploadPhoto', 'downloadPhoto', 'deletePhoto'],
			},
		},
		default: '',
		description: 'ID of the contact record',
	},
	{
		displayName: 'Related Module',
		name: 'relatedModule',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord'],
			},
		},
		options: [
			{ name: 'Pipelines', value: 'Pipelines', description: 'Pipeline (deal) records' },
			{ name: 'Tasks', value: 'Tasks', description: 'Task records' },
			{ name: 'Events', value: 'Events', description: 'Event records' },
			{ name: 'Notes', value: 'Notes', description: 'Note records' },
			{ name: 'Attachments', value: 'Attachments', description: 'Attachment records' },
			{ name: 'Emails', value: 'Emails', description: 'Email records' },
			{ name: 'Calls', value: 'Calls', description: 'Call records' },
			{ name: 'Activities', value: 'Activities', description: 'All activities' },
		],
		default: 'Pipelines',
		description: 'The related module to retrieve records from',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getRelatedRecords'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['getRelatedRecords'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 200,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Related Record ID',
		name: 'relatedRecordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['delinkRelatedRecord'],
			},
		},
		default: '',
		description: 'ID of the related record to delink',
	},
	{
		displayName: 'Related Records Data',
		name: 'relatedRecordsData',
		type: 'json',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['updateRelatedRecords'],
			},
		},
		default: '[]',
		description: 'Array of related record objects to update (max 100)',
		placeholder: '[{"id": "4150868000001234567", "Deal_Name": "Updated Deal"}]',
	},

	// ========================================
	// Send Email Operation
	// ========================================
	{
		displayName: 'From Email',
		name: 'fromEmail',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['sendEmail'],
			},
		},
		default: '',
		placeholder: 'john@company.com',
		description: 'Sender email address',
	},
	{
		displayName: 'From Name',
		name: 'fromName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['sendEmail'],
			},
		},
		default: '',
		placeholder: 'John Doe',
		description: 'Sender name',
	},
	{
		displayName: 'To Emails',
		name: 'toEmails',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['sendEmail'],
			},
		},
		default: '',
		placeholder: 'jane@client.com, bob@client.com',
		description: 'Recipient email addresses (comma-separated)',
	},
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
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
				resource: ['contact'],
				operation: ['sendEmail'],
			},
		},
		default: '',
		description: 'Email body content (HTML or plain text)',
	},
	{
		displayName: 'Additional Options',
		name: 'emailOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['sendEmail'],
			},
		},
		options: [
			{
				displayName: 'Mail Format',
				name: 'mail_format',
				type: 'options',
				options: [
					{ name: 'HTML', value: 'html' },
					{ name: 'Plain Text', value: 'text' },
				],
				default: 'html',
				description: 'Email format',
			},
			{
				displayName: 'CC Emails',
				name: 'cc',
				type: 'string',
				default: '',
				placeholder: 'cc1@example.com, cc2@example.com',
				description: 'CC recipient email addresses (comma-separated)',
			},
			{
				displayName: 'BCC Emails',
				name: 'bcc',
				type: 'string',
				default: '',
				placeholder: 'bcc1@example.com, bcc2@example.com',
				description: 'BCC recipient email addresses (comma-separated)',
			},
			{
				displayName: 'Use Organization Email',
				name: 'org_email',
				type: 'boolean',
				default: false,
				description: 'Whether to use organization email address',
			},
		],
	},

	// ========================================
	// Attachments Operations
	// ========================================
	{
		displayName: 'Attachment ID',
		name: 'attachmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['downloadAttachment', 'deleteAttachment'],
			},
		},
		default: '',
		description: 'ID of the attachment',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['uploadAttachment', 'uploadPhoto'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Put Output in Field',
		name: 'binaryProperty',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['downloadAttachment', 'downloadPhoto'],
			},
		},
		description: 'Name of the binary property to store downloaded file',
	},

	// ========================================
	// Change Owner Operation
	// ========================================
	{
		displayName: 'New Owner ID',
		name: 'newOwnerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['contact'],
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
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['changeOwner'],
			},
		},
		default: '',
		description: 'IDs of records to transfer (comma-separated for bulk, max 500)',
		placeholder: '4876876000000624001, 4876876000000624002',
	},
];
