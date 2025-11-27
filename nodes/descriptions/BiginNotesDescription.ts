import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const notesOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['note'] },
		},
		options: [
			{ name: 'List', value: 'listNotes', description: 'List notes for a record' },
			{ name: 'Get', value: 'getNote', description: 'Get a note' },
			{ name: 'Create', value: 'createNote', description: 'Create a note' },
			{ name: 'Update', value: 'updateNote', description: 'Update a note' },
			{ name: 'Delete', value: 'deleteNote', description: 'Delete a note' },
		],
		default: 'listNotes',
	},
];

export const notesFields: INodeProperties[] = [
	// Pagination
	...paginationFields('note', 'listNotes'),

	// Parent Module (for list and create)
	{
		displayName: 'Parent Module',
		name: 'parentModule',
		type: 'options',
		options: [
			{ name: 'Contact', value: 'Contacts' },
			{ name: 'Account', value: 'Accounts' },
			{ name: 'Pipeline', value: 'Pipelines' },
			{ name: 'Product', value: 'Products' },
		],
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['listNotes', 'createNote'],
			},
		},
		default: 'Contacts',
		description: 'Module the note belongs to',
	},

	// Parent Record ID (for list and create)
	{
		displayName: 'Parent Record ID',
		name: 'parentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['listNotes', 'createNote'],
			},
		},
		default: '',
		description: 'ID of the parent record',
	},

	// Note ID (for get, update, delete)
	{
		displayName: 'Note ID',
		name: 'noteId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['getNote', 'updateNote', 'deleteNote'],
			},
		},
		default: '',
		description: 'ID of the note',
	},

	// Create - Note Content (required)
	{
		displayName: 'Note Content',
		name: 'noteContent',
		type: 'string',
		typeOptions: {
			rows: 6,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['createNote'],
			},
		},
		default: '',
		description: 'Content of the note (required)',
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
				resource: ['note'],
				operation: ['createNote', 'updateNote'],
			},
		},
		options: [
			{
				displayName: 'Note Title',
				name: 'Note_Title',
				type: 'string',
				default: '',
				description: 'Title of the note (optional)',
			},
		],
	},

	// Update - Update Fields (JSON)
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'json',
		default: '{}',
		displayOptions: {
			show: {
				resource: ['note'],
				operation: ['updateNote'],
			},
		},
		description: 'Fields to update as JSON object',
		placeholder: '{"Note_Title": "Updated Title", "Note_Content": "Updated content"}',
	},
];
