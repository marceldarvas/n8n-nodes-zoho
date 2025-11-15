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
							{ name: 'Contains', value: 'contains' },
							{ name: 'Starts With', value: 'starts_with' },
						],
						default: 'contains',
						description: 'Filter operator',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to filter by',
					},
				],
			},
		],
	},
];
