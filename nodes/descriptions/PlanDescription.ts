import type { INodeProperties } from 'n8n-workflow';

export const planOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['plan'] },
		},
		options: [
			{ name: 'List', value: 'listPlans', description: 'List all plans' },
			{ name: 'Get', value: 'getPlan', description: 'Get a plan' },
			{ name: 'Create', value: 'createPlan', description: 'Create a plan' },
			{ name: 'Update', value: 'updatePlan', description: 'Update a plan' },
			{ name: 'Delete', value: 'deletePlan', description: 'Delete a plan' },
		],
		default: 'listPlans',
	},
];

export const planFields: INodeProperties[] = [
	{
		displayName: 'Plan',
		name: 'planId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getPlans',
		},
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['getPlan', 'updatePlan', 'deletePlan'],
			},
		},
		description: 'The plan to operate on',
	},
];
