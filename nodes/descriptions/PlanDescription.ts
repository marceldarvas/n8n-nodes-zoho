import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

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
		displayName: 'Plan ID',
		name: 'planId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['plan'],
				operation: ['getPlan', 'updatePlan', 'deletePlan'],
			},
		},
		description: 'ID of the plan',
	},
	...paginationFields('plan', 'listPlans'),
];
