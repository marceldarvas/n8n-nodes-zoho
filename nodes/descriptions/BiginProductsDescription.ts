import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const productsOperations: INodeProperties[] = [
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
			{ name: 'Bulk Create', value: 'bulkCreateProducts', description: 'Create multiple products' },
			{ name: 'Bulk Update', value: 'bulkUpdateProducts', description: 'Update multiple products' },
		],
		default: 'listProducts',
	},
];

export const productsFields: INodeProperties[] = [
	// Pagination
	...paginationFields('product', 'listProducts'),

	// Product ID (for get, update, delete)
	{
		displayName: 'Product ID',
		name: 'productId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getProduct', 'updateProduct', 'deleteProduct'],
			},
		},
		default: '',
		description: 'ID of the product',
	},

	// Create - Product Name (required)
	{
		displayName: 'Product Name',
		name: 'productName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['createProduct'],
			},
		},
		default: '',
		description: 'Name of the product (required)',
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
				resource: ['product'],
				operation: ['createProduct', 'updateProduct'],
			},
		},
		options: [
			{
				displayName: 'Product Code',
				name: 'Product_Code',
				type: 'string',
				default: '',
				description: 'Unique product code/SKU',
			},
			{
				displayName: 'Unit Price',
				name: 'Unit_Price',
				type: 'number',
				default: 0,
				description: 'Price per unit',
			},
			{
				displayName: 'Active',
				name: 'Product_Active',
				type: 'boolean',
				default: true,
				description: 'Whether the product is active',
			},
			{
				displayName: 'Taxable',
				name: 'Taxable',
				type: 'boolean',
				default: false,
				description: 'Whether the product is taxable',
			},
			{
				displayName: 'Tax',
				name: 'Tax',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'Tax percentage (0-100)',
			},
			{
				displayName: 'Manufacturer',
				name: 'Manufacturer',
				type: 'string',
				default: '',
				description: 'Product manufacturer',
			},
			{
				displayName: 'Product Category',
				name: 'Product_Category',
				type: 'string',
				default: '',
				description: 'Category of the product',
			},
			{
				displayName: 'Qty in Stock',
				name: 'Qty_in_Stock',
				type: 'number',
				default: 0,
				description: 'Quantity available in stock',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Product description',
			},
		],
	},

	// Filters for list
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		typeOptions: { multipleValues: true },
		placeholder: 'Add Filter',
		default: { filter: [] },
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['listProducts'],
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
							{ name: 'Product Name', value: 'Product_Name' },
							{ name: 'Product Code', value: 'Product_Code' },
							{ name: 'Product Active', value: 'Product_Active' },
							{ name: 'Product Category', value: 'Product_Category' },
							{ name: 'Unit Price', value: 'Unit_Price' },
						],
						default: 'Product_Name',
						description: 'Field to filter by',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{ name: 'Equals', value: 'equals' },
							{ name: 'Contains', value: 'contains' },
							{ name: 'Greater Than', value: 'greater_than' },
							{ name: 'Less Than', value: 'less_than' },
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

	// Bulk operations - Products Data (JSON)
	{
		displayName: 'Products Data',
		name: 'productsData',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['bulkCreateProducts', 'bulkUpdateProducts'],
			},
		},
		description: 'Array of product objects (max 100)',
		placeholder: '[{"Product_Name": "Product 1", "Unit_Price": 99.99}, {"Product_Name": "Product 2", "Unit_Price": 149.99}]',
	},
];
