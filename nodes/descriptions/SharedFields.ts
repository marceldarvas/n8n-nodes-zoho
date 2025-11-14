import type { INodeProperties } from 'n8n-workflow';

/**
 * Common field for Organization ID used across all Zoho Billing operations
 */
export const organizationId: INodeProperties = {
	displayName: 'Organization ID',
	name: 'organizationId',
	type: 'string',
	required: true,
	default: '',
	description: 'Zoho Subscriptions organization ID',
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
 * Common pagination fields for list operations with "Return All" support
 */
export function paginationFields(resource: string, operation: string): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
					returnAll: [false],
				},
			},
			typeOptions: {
				minValue: 1,
			},
			default: 50,
			description: 'Max number of results to return',
		},
	];
}
