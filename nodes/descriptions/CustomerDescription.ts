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
		displayName: 'Customer',
		name: 'customerId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomers',
		},
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
		description: 'The customer to operate on',
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
	// Create Customer Required Fields
	{
		displayName: 'Display Name',
		name: 'displayName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createCustomer'],
			},
		},
		description: 'Display name of the customer',
	},
	// Create/Update Customer Optional Fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createCustomer', 'updateCustomer'],
			},
		},
		options: [
			{
				displayName: 'Salutation',
				name: 'salutation',
				type: 'options',
				options: [
					{ name: 'Mr', value: 'Mr' },
					{ name: 'Mrs', value: 'Mrs' },
					{ name: 'Ms', value: 'Ms' },
					{ name: 'Miss', value: 'Miss' },
					{ name: 'Dr', value: 'Dr' },
				],
				default: 'Mr',
				description: 'Salutation for the customer',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'First name of the customer',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name of the customer',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				description: 'Email address of the customer',
			},
			{
				displayName: 'Company Name',
				name: 'company_name',
				type: 'string',
				default: '',
				description: 'Company name of the customer',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the customer',
			},
			{
				displayName: 'Mobile',
				name: 'mobile',
				type: 'string',
				default: '',
				description: 'Mobile number of the customer',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Website URL of the customer',
			},
			{
				displayName: 'Twitter',
				name: 'twitter',
				type: 'string',
				default: '',
				description: 'Twitter handle or URL',
			},
			{
				displayName: 'Facebook',
				name: 'facebook',
				type: 'string',
				default: '',
				description: 'Facebook profile or page URL',
			},
			{
				displayName: 'Currency Code',
				name: 'currency_code',
				type: 'string',
				default: '',
				description: 'Currency code (e.g., USD, EUR, INR)',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the customer',
			},
			{
				displayName: 'Payment Terms',
				name: 'payment_terms',
				type: 'number',
				default: 0,
				description: 'Number of days within which the customer has to pay',
			},
			{
				displayName: 'Payment Terms Label',
				name: 'payment_terms_label',
				type: 'string',
				default: '',
				description: 'Label for payment terms (e.g., "Due on Receipt", "Net 30")',
			},
			{
				displayName: 'ACH Supported',
				name: 'ach_supported',
				type: 'boolean',
				default: false,
				description: 'Whether ACH payment is supported for this customer',
			},
		],
	},
	//  Billing Address
	{
		displayName: 'Billing Address',
		name: 'billingAddress',
		type: 'fixedCollection',
		default: {},
		placeholder: 'Add Billing Address',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createCustomer', 'updateCustomer'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						description: 'State or province',
					},
					{
						displayName: 'Zip',
						name: 'zip',
						type: 'string',
						default: '',
						description: 'ZIP or postal code',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Country',
					},
					{
						displayName: 'Fax',
						name: 'fax',
						type: 'string',
						default: '',
						description: 'Fax number',
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
				resource: ['customer'],
				operation: ['createCustomer', 'updateCustomer'],
			},
		},
		options: [
			{
				displayName: 'Address',
				name: 'address',
				values: [
					{
						displayName: 'Street',
						name: 'street',
						type: 'string',
						default: '',
						description: 'Street address',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
						description: 'City',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
						description: 'State or province',
					},
					{
						displayName: 'Zip',
						name: 'zip',
						type: 'string',
						default: '',
						description: 'ZIP or postal code',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
						description: 'Country',
					},
					{
						displayName: 'Fax',
						name: 'fax',
						type: 'string',
						default: '',
						description: 'Fax number',
					},
				],
			},
		],
	},
	// Custom Fields
	{
		displayName: 'Custom Fields',
		name: 'customFields',
		type: 'fixedCollection',
		default: { fields: [] },
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Custom Field',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createCustomer', 'updateCustomer'],
			},
		},
		options: [
			{
				displayName: 'Field',
				name: 'fields',
				values: [
					{
						displayName: 'Label',
						name: 'label',
						type: 'string',
						default: '',
						description: 'Custom field label',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Custom field value',
					},
				],
			},
		],
	},
];
