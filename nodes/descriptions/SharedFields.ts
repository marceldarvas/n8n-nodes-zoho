import type { INodeProperties } from 'n8n-workflow';

/**
 * Common field for Organization ID used across all Zoho Billing operations
 */
export const organizationId: INodeProperties = {
	displayName: 'Organization',
	name: 'organizationId',
	type: 'options',
	typeOptions: {
		loadOptionsMethod: 'getOrganizations',
	},
	required: true,
	default: '',
	description: 'The Zoho Subscriptions organization to use',
};

/**
 * Common field for JSON data input used in create/update operations
 * Can be customized per resource by passing displayOptions
 */
export function jsonDataField(resources: string[], operations: string[]): INodeProperties {
	return {
		displayName: 'JSON Data',
		name: 'jsonData',
		type: 'json',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: resources,
				operation: operations,
			},
		},
		description: 'Raw JSON string for the request body',
	};
}

/**
 * Common pagination fields for list operations
 */
export function paginationFields(resource: string, operation: string): INodeProperties[] {
	return [
		{
			displayName: 'Page',
			name: 'page',
			type: 'number',
			typeOptions: { minValue: 1 },
			default: 1,
			description: 'Page number to retrieve',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
		},
		{
			displayName: 'Per Page',
			name: 'perPage',
			type: 'number',
			typeOptions: { minValue: 1, maxValue: 200 },
			default: 200,
			description: 'Number of records per page',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
		},
	];
}
