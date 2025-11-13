import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['customer'] },
		},
		options: [
			{ name: 'List', value: 'listCustomers', description: 'List all customers' },
			{ name: 'Get', value: 'getCustomer', description: 'Retrieve details of a customer' },
			{
				name: 'Get By Reference',
				value: 'getCustomerByReference',
				description: 'Get a customer by reference ID',
			},
			{ name: 'Unused Credits', value: 'getUnusedCredits', description: 'Unused Credits of a Customer' },
			{ name: 'List Transactions', value: 'listTransactions', description: 'List all transactions' },
			{ name: 'List Comments', value: 'listCustomerComments', description: 'List Customer comments' },
			{ name: 'Create', value: 'createCustomer', description: 'Create a customer' },
			{
				name: 'Enable Reminders',
				value: 'enableAllReminders',
				description: 'Enable all reminders for a customer',
			},
			{
				name: 'Stop Reminders',
				value: 'stopAllReminders',
				description: 'Stop all reminders for a customer',
			},
			{ name: 'Mark as Active', value: 'markCustomerAsActive', description: 'Mark a customer as active' },
			{
				name: 'Mark as Inactive',
				value: 'markCustomerAsInactive',
				description: 'Mark a customer as inactive',
			},
			{
				name: 'Bulk Mark as Active',
				value: 'bulkMarkCustomersAsActive',
				description: 'Bulk mark customers as active',
			},
			{
				name: 'Bulk Mark as Inactive',
				value: 'bulkMarkCustomersAsInactive',
				description: 'Bulk mark customers as inactive',
			},
			{ name: 'Update', value: 'updateCustomer', description: 'Update a customer' },
			{ name: 'Delete Comment', value: 'deleteCustomerComment', description: 'Delete a customer comment' },
			{ name: 'Delete Address', value: 'deleteCustomerAddress', description: 'Delete a customer address' },
			{ name: 'Delete', value: 'deleteCustomer', description: 'Delete a customer' },
			{ name: 'Bulk Delete', value: 'bulkDeleteCustomers', description: 'Bulk delete customers' },
		],
		default: 'listCustomers',
	},
];

export const customerFields: INodeProperties[] = [
	...paginationFields('customer', 'listCustomers'),
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		default: { filter: [] },
		typeOptions: { multipleValues: true },
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['listCustomers'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Field Name',
						name: 'filterBy',
						type: 'options',
						options: [
							{ name: 'Contact Number Contains', value: 'contact_number_contains' },
							{ name: 'Email Contains', value: 'email_contains' },
							{ name: 'Status', value: 'status' },
							{ name: 'Custom Field Contains', value: 'custom_field' },
						],
						default: 'contact_number_contains',
						description: 'Field to filter customers by',
					},
					{
						displayName: 'Value',
						name: 'filterValue',
						type: 'string',
						default: '',
						description: 'Value to filter by',
						displayOptions: {
							show: { filterBy: ['contact_number_contains', 'email_contains', 'custom_field'] },
						},
					},
					{
						displayName: 'Status',
						name: 'filterValue',
						type: 'options',
						options: [
							{ name: 'Active', value: 'active' },
							{ name: 'Inactive', value: 'inactive' },
						],
						default: 'active',
						description: 'Customer status to filter by',
						displayOptions: {
							show: {
								filterBy: ['status'],
							},
						},
					},
					{
						displayName: 'Custom Field ID',
						name: 'customFieldId',
						type: 'string',
						default: '',
						displayOptions: {
							show: { filterBy: ['custom_field'] },
						},
						description: 'Custom field number to use for custom field filter',
					},
				],
			},
		],
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: [
					'getCustomer',
					'getUnusedCredits',
					'listTransactions',
					'listCustomerComments',
					'enableAllReminders',
					'stopAllReminders',
					'markCustomerAsActive',
					'markCustomerAsInactive',
					'updateCustomer',
					'deleteCustomer',
					'deleteCustomerComment',
					'deleteCustomerAddress',
				],
			},
		},
		description: 'CRM customer ID',
	},
	{
		displayName: 'Reference ID',
		name: 'referenceId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['getCustomerByReference'],
			},
		},
		description: 'CRM reference ID of the customer',
	},
	{
		displayName: 'Reference Type',
		name: 'referenceIdType',
		type: 'options',
		default: 'zcrm_account_id',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['getCustomerByReference'],
			},
		},
		options: [
			{
				name: 'Account ID',
				value: 'zcrm_account_id',
				description: 'For accounts only and Accounts and its contacts sync',
			},
			{ name: 'Contact ID', value: 'zcrm_contact_id', description: 'For Contacts only sync' },
		],
		description: 'CRM reference ID of the customer',
	},
	{
		displayName: 'Comment ID',
		name: 'commentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['deleteCustomerComment'],
			},
		},
		description: 'ID of the comment to delete',
	},
	{
		displayName: 'Address ID',
		name: 'addressId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['deleteCustomerAddress'],
			},
		},
		description: 'ID of the address to delete',
	},
	{
		displayName: 'Customer IDs',
		name: 'customerIds',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['bulkMarkCustomersAsActive', 'bulkMarkCustomersAsInactive', 'bulkDeleteCustomers'],
			},
		},
		description: 'Comma-separated list of customer IDs',
	},
];
