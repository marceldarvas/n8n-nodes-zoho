import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const pipelinesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['pipeline'] },
		},
		options: [
			{ name: 'List', value: 'listPipelines', description: 'List all pipeline records' },
			{ name: 'Get', value: 'getPipeline', description: 'Get a pipeline record' },
			{ name: 'Create', value: 'createPipeline', description: 'Create a pipeline record' },
			{ name: 'Update', value: 'updatePipeline', description: 'Update a pipeline record' },
			{ name: 'Delete', value: 'deletePipeline', description: 'Delete a pipeline record' },
			{ name: 'Search', value: 'searchPipelines', description: 'Search pipeline records' },
			{ name: 'Get Fields', value: 'getFields', description: 'Get metadata for pipeline fields' },
			{ name: 'Bulk Create', value: 'bulkCreatePipelines', description: 'Create multiple pipeline records' },
			{ name: 'Bulk Update', value: 'bulkUpdatePipelines', description: 'Update multiple pipeline records' },
			{ name: 'Get Related Records', value: 'getRelatedRecords', description: 'Get records related to a pipeline' },
			{ name: 'Update Related Records', value: 'updateRelatedRecords', description: 'Update related records' },
			{ name: 'Delink Related Record', value: 'delinkRelatedRecord', description: 'Remove association with a related record' },
			{ name: 'Send Email', value: 'sendEmail', description: 'Send an email from Bigin' },
			{ name: 'List Attachments', value: 'listAttachments', description: 'List all attachments for a pipeline' },
			{ name: 'Upload Attachment', value: 'uploadAttachment', description: 'Upload an attachment to a pipeline' },
			{ name: 'Download Attachment', value: 'downloadAttachment', description: 'Download an attachment' },
			{ name: 'Delete Attachment', value: 'deleteAttachment', description: 'Delete an attachment' },
			{ name: 'Change Owner', value: 'changeOwner', description: 'Transfer record ownership' },
		],
		default: 'listPipelines',
	},
];

export const pipelinesFields: INodeProperties[] = [
	// Pagination
	...paginationFields('pipeline', 'listPipelines'),

	// Pipeline ID (for get, update, delete)
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipeline', 'updatePipeline', 'deletePipeline'],
			},
		},
		default: '',
		description: 'ID of the pipeline record',
	},

	// Create - Deal Name (required)
	{
		displayName: 'Deal Name',
		name: 'dealName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['createPipeline'],
			},
		},
		default: '',
		description: 'Name of the deal/opportunity',
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
				resource: ['pipeline'],
				operation: ['createPipeline', 'updatePipeline'],
			},
		},
		options: [
			{
				displayName: 'Stage',
				name: 'Stage',
				type: 'options',
				options: [
					{ name: 'Qualification', value: 'Qualification' },
					{ name: 'Needs Analysis', value: 'Needs Analysis' },
					{ name: 'Value Proposition', value: 'Value Proposition' },
					{ name: 'Identify Decision Makers', value: 'Identify Decision Makers' },
					{ name: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
					{ name: 'Negotiation/Review', value: 'Negotiation/Review' },
					{ name: 'Closed Won', value: 'Closed Won' },
					{ name: 'Closed Lost', value: 'Closed Lost' },
				],
				default: 'Qualification',
				description: 'Current stage of the pipeline',
			},
			{
				displayName: 'Amount',
				name: 'Amount',
				type: 'number',
				default: 0,
				description: 'Deal value in base currency',
			},
			{
				displayName: 'Closing Date',
				name: 'Closing_Date',
				type: 'dateTime',
				default: '',
				description: 'Expected closing date',
			},
			{
				displayName: 'Contact ID',
				name: 'Contact_Name',
				type: 'string',
				default: '',
				description: 'ID of the related contact (use format: {"id": "contact_id"})',
				placeholder: '{"id": "4150868000000224005"}',
			},
			{
				displayName: 'Account ID',
				name: 'Account_Name',
				type: 'string',
				default: '',
				description: 'ID of the related account (use format: {"id": "account_id"})',
				placeholder: '{"id": "4150868000000224003"}',
			},
			{
				displayName: 'Probability',
				name: 'Probability',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'Likelihood of closing (0-100%)',
			},
			{
				displayName: 'Pipeline',
				name: 'Pipeline',
				type: 'string',
				default: '',
				description: 'Pipeline type/category name',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Deal description/notes',
			},
			{
				displayName: 'Next Step',
				name: 'Next_Step',
				type: 'string',
				default: '',
				description: 'Next action to take',
			},
			{
				displayName: 'Lead Source',
				name: 'Lead_Source',
				type: 'string',
				default: '',
				description: 'How the lead originated',
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
				resource: ['pipeline'],
				operation: ['listPipelines', 'searchPipelines'],
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
							{ name: 'Stage', value: 'Stage' },
							{ name: 'Owner', value: 'Owner' },
							{ name: 'Amount', value: 'Amount' },
							{ name: 'Closing Date', value: 'Closing_Date' },
							{ name: 'Pipeline', value: 'Pipeline' },
							{ name: 'Deal Name', value: 'Deal_Name' },
						],
						default: 'Stage',
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
						default: 'equals',
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

	// Search term for search operation
	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['searchPipelines'],
			},
		},
		description: 'Search term to find in pipeline records',
	},

	// Bulk operations - Pipelines Data (JSON)
	{
		displayName: 'Pipelines Data',
		name: 'pipelinesData',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['bulkCreatePipelines', 'bulkUpdatePipelines'],
			},
		},
		description: 'Array of pipeline objects (max 100)',
		placeholder: '[{"Deal_Name": "Deal 1", "Amount": 5000}, {"Deal_Name": "Deal 2", "Amount": 10000}]',
	},

	// ========================================
	// Related Lists Operations
	// ========================================
	{
		displayName: 'Pipeline ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord', 'sendEmail', 'listAttachments', 'uploadAttachment'],
			},
		},
		default: '',
		description: 'ID of the pipeline record',
	},
	{
		displayName: 'Related Module',
		name: 'relatedModule',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getRelatedRecords', 'updateRelatedRecords', 'delinkRelatedRecord'],
			},
		},
		options: [
			{ name: 'Products', value: 'Products', description: 'Product line items' },
			{ name: 'Contacts', value: 'Contacts', description: 'Associated contacts' },
			{ name: 'Tasks', value: 'Tasks', description: 'Task records' },
			{ name: 'Events', value: 'Events', description: 'Event records' },
			{ name: 'Notes', value: 'Notes', description: 'Note records' },
			{ name: 'Attachments', value: 'Attachments', description: 'Attachment records' },
			{ name: 'Emails', value: 'Emails', description: 'Email records' },
			{ name: 'Calls', value: 'Calls', description: 'Call records' },
		],
		default: 'Products',
		description: 'The related module to retrieve records from',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
				operation: ['updateRelatedRecords'],
			},
		},
		default: '[]',
		description: 'Array of related record objects to update (max 100)',
		placeholder: '[{"id": "4150868000001234567", "Product_Name": "Updated Product"}]',
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
				operation: ['uploadAttachment'],
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
				resource: ['pipeline'],
				operation: ['downloadAttachment'],
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
				resource: ['pipeline'],
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
				resource: ['pipeline'],
				operation: ['changeOwner'],
			},
		},
		default: '',
		description: 'IDs of records to transfer (comma-separated for bulk, max 500)',
		placeholder: '4876876000000624001, 4876876000000624002',
	},
];
