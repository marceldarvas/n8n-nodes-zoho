import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const tasksOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['task'] },
		},
		options: [
			{ name: 'List', value: 'listTasks', description: 'List all tasks' },
			{ name: 'Get', value: 'getTask', description: 'Get a task' },
			{ name: 'Create', value: 'createTask', description: 'Create a task' },
			{ name: 'Update', value: 'updateTask', description: 'Update a task' },
			{ name: 'Delete', value: 'deleteTask', description: 'Delete a task' },
			{ name: 'Upsert', value: 'upsertTask', description: 'Create or update a task (idempotent)' },
		],
		default: 'listTasks',
	},
];

export const tasksFields: INodeProperties[] = [
	// Pagination
	...paginationFields('task', 'listTasks'),

	// Task ID (for get, update, delete)
	{
		displayName: 'Task ID',
		name: 'taskId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['getTask', 'updateTask', 'deleteTask'],
			},
		},
		default: '',
		description: 'ID of the task',
	},

	// Create - Subject (required)
	{
		displayName: 'Subject',
		name: 'subject',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['createTask', 'upsertTask'],
			},
		},
		default: '',
		description: 'Subject/title of the task (required)',
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
				resource: ['task'],
				operation: ['createTask', 'updateTask', 'upsertTask'],
			},
		},
		options: [
			{
				displayName: 'Due Date',
				name: 'Due_Date',
				type: 'dateTime',
				default: '',
				description: 'When the task is due',
			},
			{
				displayName: 'Priority',
				name: 'Priority',
				type: 'options',
				options: [
					{ name: 'Highest', value: 'Highest' },
					{ name: 'High', value: 'High' },
					{ name: 'Normal', value: 'Normal' },
					{ name: 'Low', value: 'Low' },
					{ name: 'Lowest', value: 'Lowest' },
				],
				default: 'Normal',
				description: 'Task priority',
			},
			{
				displayName: 'Status',
				name: 'Status',
				type: 'options',
				options: [
					{ name: 'Not Started', value: 'Not Started' },
					{ name: 'In Progress', value: 'In Progress' },
					{ name: 'Completed', value: 'Completed' },
					{ name: 'Deferred', value: 'Deferred' },
					{ name: 'Waiting for Input', value: 'Waiting for input' },
				],
				default: 'Not Started',
				description: 'Task status',
			},
			{
				displayName: 'Related To Module',
				name: '$se_module',
				type: 'options',
				options: [
					{ name: 'Contacts', value: 'Contacts' },
					{ name: 'Accounts', value: 'Accounts' },
					{ name: 'Pipelines', value: 'Pipelines' },
				],
				default: 'Contacts',
				description: 'Module the task is related to',
			},
			{
				displayName: 'Related Record ID',
				name: 'What_Id',
				type: 'string',
				default: '',
				description: 'ID of the related record (use format: {"id": "record_id"})',
				placeholder: '{"id": "4150868000000225013"}',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Task description/notes',
			},
			{
				displayName: 'Reminder',
				name: 'Remind_At',
				type: 'dateTime',
				default: '',
				description: 'When to send a reminder',
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
				resource: ['task'],
				operation: ['listTasks'],
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
							{ name: 'Status', value: 'Status' },
							{ name: 'Priority', value: 'Priority' },
							{ name: 'Due Date', value: 'Due_Date' },
							{ name: 'Owner', value: 'Owner' },
						],
						default: 'Status',
						description: 'Field to filter by',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{ name: 'Equals', value: 'equals' },
							{ name: 'Greater Than', value: 'greater_than' },
							{ name: 'Less Than', value: 'less_than' },
						],
						default: 'equals',
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

	// Upsert operation - Duplicate Check Fields
	{
		displayName: 'Duplicate Check Fields',
		name: 'duplicateCheckFields',
		type: 'multiOptions',
		required: true,
		displayOptions: {
			show: {
				resource: ['task'],
				operation: ['upsertTask'],
			},
		},
		options: [
			{ name: 'Subject', value: 'Subject' },
			{ name: 'Due Date', value: 'Due_Date' },
			{ name: 'Related To', value: 'Related_To' },
		],
		default: ['Subject'],
		description: 'Fields to use for duplicate detection. If a task with matching values exists, it will be updated; otherwise, a new task will be created.',
	},
];
