import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const accountsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['account'] },
		},
		options: [
			{ name: 'List', value: 'listAccounts', description: 'List all companies/accounts' },
			{ name: 'Get', value: 'getAccount', description: 'Get a company/account' },
			{ name: 'Create', value: 'createAccount', description: 'Create a company/account' },
			{ name: 'Update', value: 'updateAccount', description: 'Update a company/account' },
			{ name: 'Delete', value: 'deleteAccount', description: 'Delete a company/account' },
			{ name: 'Search', value: 'searchAccounts', description: 'Search companies/accounts' },
			{ name: 'Get Fields', value: 'getFields', description: 'Get metadata for account fields' },
			{ name: 'Bulk Create', value: 'bulkCreateAccounts', description: 'Create multiple companies/accounts' },
			{ name: 'Bulk Update', value: 'bulkUpdateAccounts', description: 'Update multiple companies/accounts' },
			{ name: 'Get Related Records', value: 'getRelatedRecords', description: 'Get records related to an account' },
			{ name: 'Update Related Records', value: 'updateRelatedRecords', description: 'Update related records' },
			{ name: 'Delink Related Record', value: 'delinkRelatedRecord', description: 'Remove association with a related record' },
			{ name: 'Send Email', value: 'sendEmail', description: 'Send an email from Bigin' },
			{ name: 'List Attachments', value: 'listAttachments', description: 'List all attachments for an account' },
			{ name: 'Upload Attachment', value: 'uploadAttachment', description: 'Upload an attachment to an account' },
			{ name: 'Download Attachment', value: 'downloadAttachment', description: 'Download an attachment' },
			{ name: 'Delete Attachment', value: 'deleteAttachment', description: 'Delete an attachment' },
			{ name: 'Upload Photo', value: 'uploadPhoto', description: 'Upload a profile photo' },
			{ name: 'Download Photo', value: 'downloadPhoto', description: 'Download profile photo' },
			{ name: 'Delete Photo', value: 'deletePhoto', description: 'Delete profile photo' },
			{ name: 'Change Owner', value: 'changeOwner', description: 'Transfer record ownership' },
		],
		default: 'listAccounts',
	},
];

export const accountsFields: INodeProperties[] = [
	// Pagination
	...paginationFields('account', 'listAccounts'),

	// Account ID (for get, update, delete)
	{
		displayName: 'Account ID',
		name: 'accountId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getAccount', 'updateAccount', 'deleteAccount'],
			},
		},
		default: '',
		description: 'ID of the account/company',
	},

	// Create - Account Name (required)
	{
		displayName: 'Account Name',
		name: 'accountName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createAccount'],
			},
		},
		default: '',
		description: 'Name of the company/account (required)',
	},

	// Create/Update - Additional Fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createAccount', 'updateAccount'],
			},
		},
		options: [
			{
				displayName: 'Website',
				name: 'Website',
				type: 'string',
				default: '',
				placeholder: 'https://www.example.com',
				description: 'Company website URL',
			},
			{
				displayName: 'Phone',
				name: 'Phone',
				type: 'string',
				default: '',
				description: 'Company phone number',
			},
			{
				displayName: 'Industry',
				name: 'Industry',
				type: 'options',
				options: [
					{ name: 'Technology', value: 'Technology' },
					{ name: 'Healthcare', value: 'Healthcare' },
					{ name: 'Finance', value: 'Finance' },
					{ name: 'Manufacturing', value: 'Manufacturing' },
					{ name: 'Retail', value: 'Retail' },
					{ name: 'Education', value: 'Education' },
					{ name: 'Consulting', value: 'Consulting' },
					{ name: 'Real Estate', value: 'Real Estate' },
					{ name: 'Other', value: 'Other' },
				],
				default: 'Technology',
				description: 'Industry sector',
			},
			{
				displayName: 'Employees',
				name: 'Employees',
				type: 'number',
				default: 0,
				description: 'Number of employees',
			},
			{
				displayName: 'Annual Revenue',
				name: 'Annual_Revenue',
				type: 'number',
				default: 0,
				description: 'Annual revenue amount',
			},
			{
				displayName: 'Account Type',
				name: 'Account_Type',
				type: 'string',
				default: '',
				description: 'Type of account',
			},
			{
				displayName: 'Parent Account ID',
				name: 'Parent_Account',
				type: 'string',
				default: '',
				description: 'ID of parent account for hierarchies (use format: {"id": "account_id"})',
				placeholder: '{"id": "4150868000000224003"}',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the account',
			},
		],
	},

	// Billing Address
	{
		displayName: 'Billing Address',
		name: 'billingAddress',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Billing Address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createAccount', 'updateAccount'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{
						displayName: 'Street',
						name: 'Billing_Street',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'City',
						name: 'Billing_City',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'State',
						name: 'Billing_State',
						type: 'string',
						default: '',
						description: 'State or province',
					},
					{
						displayName: 'Zip',
						name: 'Billing_Code',
						type: 'string',
						default: '',
						description: 'ZIP or postal code',
					},
					{
						displayName: 'Country',
						name: 'Billing_Country',
						type: 'string',
						default: '',
						description: 'Country',
					},
				],
			},
		],
	},

	// Shipping Address
	{
		displayName: 'Shipping Address',
		name: 'shippingAddress',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Shipping Address',
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['createAccount', 'updateAccount'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{
						displayName: 'Street',
						name: 'Shipping_Street',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'City',
						name: 'Shipping_City',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'State',
						name: 'Shipping_State',
						type: 'string',
						default: '',
						description: 'State or province',
					},
					{
						displayName: 'Zip',
						name: 'Shipping_Code',
						type: 'string',
						default: '',
						description: 'ZIP or postal code',
					},
					{
						displayName: 'Country',
						name: 'Shipping_Country',
						type: 'string',
						default: '',
						description: 'Country',
					},
				],
			},
		],
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
				resource: ['account'],
				operation: ['listAccounts', 'searchAccounts'],
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
							{ name: 'Account Name', value: 'Account_Name' },
							{ name: 'Website', value: 'Website' },
							{ name: 'Industry', value: 'Industry' },
							{ name: 'Owner', value: 'Owner' },
							{ name: 'Created Time', value: 'Created_Time' },
							{ name: 'Modified Time', value: 'Modified_Time' },
						],
						default: 'Account_Name',
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

	// Bulk operations - Accounts Data (JSON)
	{
		displayName: 'Accounts Data',
		name: 'accountsData',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['bulkCreateAccounts', 'bulkUpdateAccounts'],
			},
		},
		description: 'Array of account objects (max 100)',
		placeholder: '[{"Account_Name": "Company 1", "Phone": "123-456-7890"}, {"Account_Name": "Company 2", "Phone": "098-765-4321"}]',
	},

	// ========================================
	// Related Lists Operations
	// ========================================
	{
		displayName: 'Account ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord', 'sendEmail', 'listAttachments', 'uploadAttachment', 'uploadPhoto', 'downloadPhoto', 'deletePhoto'],
			},
		},
		default: '',
		description: 'ID of the account record',
	},
	{
		displayName: 'Related Module',
		name: 'relatedModule',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['account'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord'],
			},
		},
		options: [
			{ name: 'Contacts', value: 'Contacts', description: 'Contact records' },
			{ name: 'Pipelines', value: 'Pipelines', description: 'Pipeline (deal) records' },
			{ name: 'Tasks', value: 'Tasks', description: 'Task records' },
			{ name: 'Events', value: 'Events', description: 'Event records' },
			{ name: 'Notes', value: 'Notes', description: 'Note records' },
			{ name: 'Attachments', value: 'Attachments', description: 'Attachment records' },
			{ name: 'Emails', value: 'Emails', description: 'Email records' },
			{ name: 'Calls', value: 'Calls', description: 'Call records' },
		],
		default: 'Contacts',
		description: 'The related module to retrieve records from',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
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
				resource: ['account'],
				operation: ['changeOwner'],
			},
		},
		default: '',
		description: 'IDs of records to transfer (comma-separated for bulk, max 500)',
		placeholder: '4876876000000624001, 4876876000000624002',
	},
];
