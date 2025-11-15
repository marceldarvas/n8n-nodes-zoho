import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const pipelinesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['pipeline'] },
		},
		options: [
			{ name: 'List', value: 'listPipelines', description: 'List all pipeline records' },
			{ name: 'Get', value: 'getPipeline', description: 'Get a pipeline record' },
			{ name: 'Create', value: 'createPipeline', description: 'Create a pipeline record' },
			{ name: 'Update', value: 'updatePipeline', description: 'Update a pipeline record' },
			{ name: 'Delete', value: 'deletePipeline', description: 'Delete a pipeline record' },
			{ name: 'Search', value: 'searchPipelines', description: 'Search pipeline records' },
			{ name: 'Bulk Create', value: 'bulkCreatePipelines', description: 'Create multiple pipeline records' },
			{ name: 'Bulk Update', value: 'bulkUpdatePipelines', description: 'Update multiple pipeline records' },
		],
		default: 'listPipelines',
	},
];

export const pipelinesFields: INodeProperties[] = [
	// Pagination
	...paginationFields('pipeline', 'listPipelines'),

	// Pipeline ID (for get, update, delete)
	{
		displayName: 'Pipeline ID',
		name: 'pipelineId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['getPipeline', 'updatePipeline', 'deletePipeline'],
			},
		},
		default: '',
		description: 'ID of the pipeline record',
	},

	// Create - Deal Name (required)
	{
		displayName: 'Deal Name',
		name: 'dealName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['createPipeline'],
			},
		},
		default: '',
		description: 'Name of the deal/opportunity',
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
				resource: ['pipeline'],
				operation: ['createPipeline', 'updatePipeline'],
			},
		},
		options: [
			{
				displayName: 'Stage',
				name: 'Stage',
				type: 'options',
				options: [
					{ name: 'Qualification', value: 'Qualification' },
					{ name: 'Needs Analysis', value: 'Needs Analysis' },
					{ name: 'Value Proposition', value: 'Value Proposition' },
					{ name: 'Identify Decision Makers', value: 'Identify Decision Makers' },
					{ name: 'Proposal/Price Quote', value: 'Proposal/Price Quote' },
					{ name: 'Negotiation/Review', value: 'Negotiation/Review' },
					{ name: 'Closed Won', value: 'Closed Won' },
					{ name: 'Closed Lost', value: 'Closed Lost' },
				],
				default: 'Qualification',
				description: 'Current stage of the pipeline',
			},
			{
				displayName: 'Amount',
				name: 'Amount',
				type: 'number',
				default: 0,
				description: 'Deal value in base currency',
			},
			{
				displayName: 'Closing Date',
				name: 'Closing_Date',
				type: 'dateTime',
				default: '',
				description: 'Expected closing date',
			},
			{
				displayName: 'Contact ID',
				name: 'Contact_Name',
				type: 'string',
				default: '',
				description: 'ID of the related contact (use format: {"id": "contact_id"})',
				placeholder: '{"id": "4150868000000224005"}',
			},
			{
				displayName: 'Account ID',
				name: 'Account_Name',
				type: 'string',
				default: '',
				description: 'ID of the related account (use format: {"id": "account_id"})',
				placeholder: '{"id": "4150868000000224003"}',
			},
			{
				displayName: 'Probability',
				name: 'Probability',
				type: 'number',
				typeOptions: {
					minValue: 0,
					maxValue: 100,
				},
				default: 0,
				description: 'Likelihood of closing (0-100%)',
			},
			{
				displayName: 'Pipeline',
				name: 'Pipeline',
				type: 'string',
				default: '',
				description: 'Pipeline type/category name',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Deal description/notes',
			},
			{
				displayName: 'Next Step',
				name: 'Next_Step',
				type: 'string',
				default: '',
				description: 'Next action to take',
			},
			{
				displayName: 'Lead Source',
				name: 'Lead_Source',
				type: 'string',
				default: '',
				description: 'How the lead originated',
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
				resource: ['pipeline'],
				operation: ['listPipelines', 'searchPipelines'],
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
							{ name: 'Stage', value: 'Stage' },
							{ name: 'Owner', value: 'Owner' },
							{ name: 'Amount', value: 'Amount' },
							{ name: 'Closing Date', value: 'Closing_Date' },
							{ name: 'Pipeline', value: 'Pipeline' },
							{ name: 'Deal Name', value: 'Deal_Name' },
						],
						default: 'Stage',
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
							{ name: 'Greater Than', value: 'greater_than' },
							{ name: 'Less Than', value: 'less_than' },
							{ name: 'Between', value: 'between' },
						],
						default: 'equals',
						description: 'Filter operator',
					},
					{
						displayName: 'Value',
						name: 'value',
						type: 'string',
						default: '',
						description: 'Value to filter by. For "between", use comma-separated values (e.g., "1000,5000")',
					},
				],
			},
		],
	},

	// Search term for search operation
	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['searchPipelines'],
			},
		},
		description: 'Search term to find in pipeline records',
	},

	// Bulk operations - Pipelines Data (JSON)
	{
		displayName: 'Pipelines Data',
		name: 'pipelinesData',
		type: 'json',
		default: '[]',
		required: true,
		displayOptions: {
			show: {
				resource: ['pipeline'],
				operation: ['bulkCreatePipelines', 'bulkUpdatePipelines'],
			},
		},
		description: 'Array of pipeline objects (max 100)',
		placeholder: '[{"Deal_Name": "Deal 1", "Amount": 5000}, {"Deal_Name": "Deal 2", "Amount": 10000}]',
	},
];
