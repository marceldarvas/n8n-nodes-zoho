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
			{ name: 'Delete', value: 'deleteContact', description: 'Delete a contact' },
			{ name: 'Search', value: 'searchContacts', description: 'Search contacts' },
			{ name: 'Bulk Create', value: 'bulkCreateContacts', description: 'Create multiple contacts' },
			{ name: 'Bulk Update', value: 'bulkUpdateContacts', description: 'Update multiple contacts' },
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

	// Create/Update - Additional Fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['contact'],
				operation: ['createContact', 'updateContact'],
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
				operation: ['createContact', 'updateContact'],
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
];
