import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const eventOperations: INodeProperties[] = [
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
		],
		default: 'listEvents',
	},
];

export const eventFields: INodeProperties[] = [
	{
		displayName: 'Event ID',
		name: 'eventId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['event'],
				operation: ['getEvent'],
			},
		},
		description: 'ID of the event',
	},
	...paginationFields('event', 'listEvents'),
];
