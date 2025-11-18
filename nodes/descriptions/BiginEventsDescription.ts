import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const eventsOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['event'] },
		},
		options: [
			{ name: 'List', value: 'listEvents', description: 'List all events' },
			{ name: 'Get', value: 'getEvent', description: 'Get an event' },
			{ name: 'Create', value: 'createEvent', description: 'Create an event' },
			{ name: 'Update', value: 'updateEvent', description: 'Update an event' },
			{ name: 'Delete', value: 'deleteEvent', description: 'Delete an event' },
			{ name: 'Upsert', value: 'upsertEvent', description: 'Create or update an event (idempotent)' },
			{ name: 'Get Deleted Records', value: 'getDeletedRecords', description: 'Get deleted events with metadata' },
		],
		default: 'listEvents',
	},
];

export const eventsFields: INodeProperties[] = [
	// Pagination
	...paginationFields('event', 'listEvents'),

	// Event ID (for get, update, delete)
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getEvent', 'updateEvent', 'deleteEvent'],
			},
		},
		default: '',
		description: 'ID of the event',
	},

	// Create - Required Fields
	{
		displayName: 'Title',
		name: 'eventTitle',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'upsertEvent'],
			},
		},
		default: '',
		description: 'Title of the event (required)',
	},
	{
		displayName: 'Start DateTime',
		name: 'startDateTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'upsertEvent'],
			},
		},
		default: '',
		description: 'When the event starts (required)',
	},
	{
		displayName: 'End DateTime',
		name: 'endDateTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['createEvent', 'upsertEvent'],
			},
		},
		default: '',
		description: 'When the event ends (required)',
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
				resource: ['event'],
				operation: ['createEvent', 'updateEvent', 'upsertEvent'],
			},
		},
		options: [
			{
				displayName: 'All Day Event',
				name: 'All_day',
				type: 'boolean',
				default: false,
				description: 'Whether this is an all-day event',
			},
			{
				displayName: 'Location',
				name: 'Venue',
				type: 'string',
				default: '',
				description: 'Event location or venue',
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
				description: 'Module the event is related to',
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
				displayName: 'Participants',
				name: 'Participants',
				type: 'string',
				default: '',
				description: 'Array of participant IDs (JSON format: [{"id": "contact_id"}])',
				placeholder: '[{"id": "4150868000000224005"}]',
			},
			{
				displayName: 'Description',
				name: 'Description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Event description/notes',
			},
			{
				displayName: 'Reminder',
				name: 'Remind_At',
				type: 'options',
				options: [
					{ name: 'None', value: '' },
					{ name: '5 Minutes Before', value: '5 minutes before' },
					{ name: '15 Minutes Before', value: '15 minutes before' },
					{ name: '30 Minutes Before', value: '30 minutes before' },
					{ name: '1 Hour Before', value: '1 hour before' },
					{ name: '1 Day Before', value: '1 day before' },
				],
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
				resource: ['event'],
				operation: ['listEvents'],
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
							{ name: 'Start DateTime', value: 'Start_DateTime' },
							{ name: 'Owner', value: 'Owner' },
							{ name: 'Related Module', value: '$se_module' },
						],
						default: 'Start_DateTime',
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
						description: 'Value to filter by. For "between", use comma-separated values',
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
				resource: ['event'],
				operation: ['upsertEvent'],
			},
		},
		options: [
			{ name: 'Event Title', value: 'Event_Title' },
			{ name: 'Start DateTime', value: 'Start_DateTime' },
			{ name: 'End DateTime', value: 'End_DateTime' },
			{ name: 'Related To', value: 'Related_To' },
		],
		default: ['Event_Title', 'Start_DateTime'],
		description: 'Fields to use for duplicate detection. If an event with matching values exists, it will be updated; otherwise, a new event will be created.',
	},

	// Get Deleted Records - Pagination
	...paginationFields('event', 'getDeletedRecords'),

	// Get Deleted Records - Deletion Type
	{
		displayName: 'Deletion Type',
		name: 'deletionType',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['event'],
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
];
