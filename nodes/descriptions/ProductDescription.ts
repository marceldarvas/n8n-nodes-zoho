import type { INodeProperties } from 'n8n-workflow';

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
		displayName: 'Product',
		name: 'productId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProducts',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getProduct', 'updateProduct', 'deleteProduct'],
			},
		},
		description: 'The product to operate on',
	},
	// Create Product Required Fields
	{
		displayName: 'Product Name',
		name: 'productName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		description: 'Name of the product',
	},
	// Create/Update Product Optional Fields
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct', 'updateProduct'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Description of the product',
			},
			{
				displayName: 'Email IDs',
				name: 'email_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of email addresses to send notifications to',
			},
			{
				displayName: 'Redirect URL',
				name: 'redirect_url',
				type: 'string',
				default: '',
				description: 'URL to redirect to after purchase',
			},
		],
	},
];
