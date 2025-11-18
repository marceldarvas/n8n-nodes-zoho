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
			{ name: 'Upsert', value: 'upsertProduct', description: 'Create or update a product (idempotent)' },
			{ name: 'Get Deleted Records', value: 'getDeletedRecords', description: 'Get deleted products with metadata' },
			{ name: 'Get Fields', value: 'getFields', description: 'Get metadata for product fields' },
			{ name: 'Get Modules', value: 'getModules', description: 'Get all available modules' },
			{ name: 'Get Organization', value: 'getOrganization', description: 'Get organization information' },
			{ name: 'Bulk Create', value: 'bulkCreateProducts', description: 'Create multiple products' },
			{ name: 'Bulk Update', value: 'bulkUpdateProducts', description: 'Update multiple products' },
			{ name: 'Upload Photo', value: 'uploadPhoto', description: 'Upload a product photo' },
			{ name: 'Download Photo', value: 'downloadPhoto', description: 'Download product photo' },
			{ name: 'Delete Photo', value: 'deletePhoto', description: 'Delete product photo' },
			{ name: 'Change Owner', value: 'changeOwner', description: 'Transfer record ownership' },
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
				operation: ['createProduct', 'upsertProduct'],
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
				operation: ['createProduct', 'updateProduct', 'upsertProduct'],
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

	// Upsert operation - Duplicate Check Fields
	{
		displayName: 'Duplicate Check Fields',
		name: 'duplicateCheckFields',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['upsertProduct'],
			},
		},
		options: [
			{ name: 'Product Name', value: 'Product_Name' },
			{ name: 'Product Code', value: 'Product_Code' },
			{ name: 'SKU', value: 'SKU' },
		],
		default: ['Product_Name'],
		description: 'Fields to use for duplicate detection. If a product with matching values exists, it will be updated; otherwise, a new product will be created.',
	},

	// Get Deleted Records - Pagination
	...paginationFields('product', 'getDeletedRecords'),

	// Get Deleted Records - Deletion Type
	{
		displayName: 'Deletion Type',
		name: 'deletionType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['getDeletedRecords'],
			},
		},
		options: [
			{ name: 'All', value: 'all', description: 'All deleted records' },
			{ name: 'Recycle Bin', value: 'recycle', description: 'Records in recycle bin (recoverable)' },
			{ name: 'Permanent', value: 'permanent', description: 'Permanently deleted records' },
		],
		default: 'all',
		description: 'Type of deleted records to retrieve',
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

	// ========================================
	// Photo Operations
	// ========================================
	{
		displayName: 'Product ID',
		name: 'recordId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadPhoto', 'downloadPhoto', 'deletePhoto'],
			},
		},
		default: '',
		description: 'ID of the product record',
	},
	{
		displayName: 'Input Binary Field',
		name: 'binaryPropertyName',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['uploadPhoto'],
			},
		},
		description: 'Name of the binary property containing the file to upload',
	},
	{
		displayName: 'Put Output in Field',
		name: 'binaryProperty',
		type: 'string',
		required: true,
		default: 'data',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['downloadPhoto'],
			},
		},
		description: 'Name of the binary property to store downloaded file',
	},

	// ========================================
	// Change Owner Operation
	// ========================================
	{
		displayName: 'New Owner ID',
		name: 'newOwnerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['changeOwner'],
			},
		},
		default: '',
		description: 'User ID of the new owner',
		placeholder: '4876876000000225001',
	},
	{
		displayName: 'Record IDs',
		name: 'recordIds',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['changeOwner'],
			},
		},
		default: '',
		description: 'IDs of records to transfer (comma-separated for bulk, max 500)',
		placeholder: '4876876000000624001, 4876876000000624002',
	},
];
