import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const productOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['product'] },
		},
		options: [
			{ name: 'List', value: 'listProducts', description: 'List all products' },
			{ name: 'Get', value: 'getProduct', description: 'Get a product' },
			{ name: 'Create', value: 'createProduct', description: 'Create a product' },
			{ name: 'Update', value: 'updateProduct', description: 'Update a product' },
			{ name: 'Delete', value: 'deleteProduct', description: 'Delete a product' },
		],
		default: 'listProducts',
	},
];

export const productFields: INodeProperties[] = [
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getProduct', 'updateProduct', 'deleteProduct'],
			},
		},
		description: 'ID of the product',
	},
	...paginationFields('product', 'listProducts'),
];
