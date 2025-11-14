import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const itemOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['item'] },
		},
		options: [
			{ name: 'List', value: 'listItems', description: 'List all items' },
			{ name: 'Get', value: 'getItem', description: 'Get an item' },
		],
		default: 'listItems',
	},
];

export const itemFields: INodeProperties[] = [
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['item'],
				operation: ['getItem'],
			},
		},
		description: 'ID of the item',
	},
	...paginationFields('item', 'listItems'),
];
