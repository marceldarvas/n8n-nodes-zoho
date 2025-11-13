import type { INodeProperties } from 'n8n-workflow';

export const addonOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['addon'] },
		},
		options: [
			{ name: 'List', value: 'listAddons', description: 'List all add-ons' },
			{ name: 'Get', value: 'getAddon', description: 'Get an add-on' },
			{ name: 'Create', value: 'createAddon', description: 'Create an add-on' },
			{ name: 'Update', value: 'updateAddon', description: 'Update an add-on' },
			{ name: 'Delete', value: 'deleteAddon', description: 'Delete an add-on' },
		],
		default: 'listAddons',
	},
];

export const addonFields: INodeProperties[] = [
	{
		displayName: 'Add-on ID',
		name: 'addonId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['addon'],
				operation: ['getAddon', 'updateAddon', 'deleteAddon'],
			},
		},
		description: 'ID of the add-on',
	},
];
