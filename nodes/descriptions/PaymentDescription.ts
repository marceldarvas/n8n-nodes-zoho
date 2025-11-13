import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['payment'] },
		},
		options: [
			{ name: 'List', value: 'listPayments', description: 'List all payments' },
			{ name: 'Get', value: 'getPayment', description: 'Get a payment' },
			{ name: 'Create', value: 'createPayment', description: 'Create a payment' },
		],
		default: 'listPayments',
	},
];

export const paymentFields: INodeProperties[] = [
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['getPayment'],
			},
		},
		description: 'ID of the payment',
	},
	...paginationFields('payment', 'listPayments'),
];
