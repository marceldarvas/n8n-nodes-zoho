import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['invoice'] },
		},
		options: [
			{ name: 'List', value: 'listInvoices', description: 'List all invoices' },
			{ name: 'Get', value: 'getInvoice', description: 'Get an invoice' },
			{ name: 'Create', value: 'createInvoice', description: 'Create an invoice' },
			{ name: 'Update', value: 'updateInvoice', description: 'Update an invoice' },
			{ name: 'Delete', value: 'deleteInvoice', description: 'Delete an invoice' },
		],
		default: 'listInvoices',
	},
];

export const invoiceFields: INodeProperties[] = [
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['getInvoice', 'updateInvoice', 'deleteInvoice'],
			},
		},
		description: 'ID of the invoice',
	},
	...paginationFields('invoice', 'listInvoices'),
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		default: '',
		required: false,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
		description: 'Filter by subscription ID to list invoices for a specific subscription',
	},
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		default: '',
		required: false,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
		description: 'Filter by customer ID to list invoices for a specific customer',
	},
	{
		displayName: 'Filter By',
		name: 'filterBy',
		type: 'options',
		options: [
			{ name: 'All', value: 'All' },
			{ name: 'Sent', value: 'Sent' },
			{ name: 'Draft', value: 'Draft' },
			{ name: 'Overdue', value: 'OverDue' },
			{ name: 'Paid', value: 'Paid' },
			{ name: 'Partially Paid', value: 'PartiallyPaid' },
			{ name: 'Void', value: 'Void' },
			{ name: 'Unpaid', value: 'Unpaid' },
		],
		default: 'All',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['listInvoices'],
			},
		},
		description: 'Filter by invoice status',
	},
];
