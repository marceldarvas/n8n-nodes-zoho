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

/**
 * Helper function to create "Return All" and "Limit" fields for list operations
 * This is for Task 8 pagination support when implemented
 * @param resource - The resource type (e.g., 'customer', 'product')
 * @param operation - The list operation (e.g., 'getAll', 'list')
 * @returns Array of INodeProperties for returnAll and limit fields
 */
export function makeGetAllFields(
	resource: string,
	operation: string = 'getAll',
): INodeProperties[] {
	return [
		{
			displayName: 'Return All',
			name: 'returnAll',
			type: 'boolean',
			displayOptions: { show: { resource: [resource], operation: [operation] } },
			default: false,
			description: 'Whether to return all results or only up to a given limit',
		},
		{
			displayName: 'Limit',
			name: 'limit',
			type: 'number',
			displayOptions: {
				show: { resource: [resource], operation: [operation], returnAll: [false] },
			},
			typeOptions: { minValue: 1, maxValue: 1000 },
			default: 50,
			description: 'Max number of results to return',
		},
	];
}

/**
 * Helper function to create a resource ID field
 * @param resource - The resource type (e.g., 'product', 'customer', 'subscription')
 * @param operations - Array of operations that require this ID (e.g., ['get', 'update', 'delete'])
 * @param resourceDisplayName - Optional display name for the resource (defaults to capitalized resource)
 * @returns INodeProperties object for the resource ID field
 */
export function makeResourceIdField(
	resource: string,
	operations: string[],
	resourceDisplayName?: string,
): INodeProperties {
	const displayName = resourceDisplayName || resource.charAt(0).toUpperCase() + resource.slice(1);
	return {
		displayName: `${displayName} ID`,
		name: `${resource}Id`,
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: [resource],
				operation: operations,
			},
		},
		description: `ID of the ${displayName.toLowerCase()}`,
	};
}

/**
 * Helper function to create sort fields
 * @param resource - The resource type (e.g., 'customer', 'product')
 * @param operation - The operation that supports sorting (typically list operations)
 * @param sortOptions - Array of sortable field options
 * @returns Array of INodeProperties for sort column and order fields
 */
export function makeSortFields(
	resource: string,
	operation: string,
	sortOptions: Array<{ name: string; value: string }>,
): INodeProperties[] {
	return [
		{
			displayName: 'Sort Column',
			name: 'sortColumn',
			type: 'options',
			options: sortOptions,
			default: sortOptions[0]?.value || '',
			description: 'Column to sort by',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
		},
		{
			displayName: 'Sort Order',
			name: 'sortOrder',
			type: 'options',
			options: [
				{ name: 'Ascending', value: 'ascending' },
				{ name: 'Descending', value: 'descending' },
			],
			default: 'ascending',
			description: 'Sort order',
			displayOptions: {
				show: {
					resource: [resource],
					operation: [operation],
				},
			},
		},
	];
}

/**
 * Helper function to create a simple string field with display options
 * @param displayName - Display name for the field
 * @param name - Internal name for the field
 * @param resource - The resource type (can be string or array)
 * @param operations - Array of operations that use this field
 * @param description - Field description
 * @param required - Whether the field is required
 * @returns INodeProperties for the string field
 */
export function makeStringField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	description: string,
	required: boolean = false,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'string',
		default: '',
		required,
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
		description,
	};
}

/**
 * Helper function to create an options field with display options
 * @param displayName - Display name for the field
 * @param name - Internal name for the field
 * @param resource - The resource type (can be string or array)
 * @param operations - Array of operations that use this field
 * @param options - Array of option objects
 * @param description - Field description
 * @param defaultValue - Default option value
 * @returns INodeProperties for the options field
 */
export function makeOptionsField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	options: Array<{ name: string; value: string; description?: string }>,
	description: string,
	defaultValue?: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'options',
		options,
		default: defaultValue || options[0]?.value || '',
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
		description,
	};
}

/**
 * Helper function to create a number field with display options
 * @param displayName - Display name for the field
 * @param name - Internal name for the field
 * @param resource - The resource type (can be string or array)
 * @param operations - Array of operations that use this field
 * @param description - Field description
 * @param defaultValue - Default number value
 * @param minValue - Minimum allowed value
 * @param maxValue - Maximum allowed value
 * @returns INodeProperties for the number field
 */
export function makeNumberField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	description: string,
	defaultValue: number = 0,
	minValue?: number,
	maxValue?: number,
): INodeProperties {
	const field: INodeProperties = {
		displayName,
		name,
		type: 'number',
		default: defaultValue,
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
		description,
	};

	if (minValue !== undefined || maxValue !== undefined) {
		field.typeOptions = {};
		if (minValue !== undefined) {
			field.typeOptions.minValue = minValue;
		}
		if (maxValue !== undefined) {
			field.typeOptions.maxValue = maxValue;
		}
	}

	return field;
}

/**
 * Helper function to create a boolean field with display options
 * @param displayName - Display name for the field
 * @param name - Internal name for the field
 * @param resource - The resource type (can be string or array)
 * @param operations - Array of operations that use this field
 * @param description - Field description
 * @param defaultValue - Default boolean value
 * @returns INodeProperties for the boolean field
 */
export function makeBooleanField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	description: string,
	defaultValue: boolean = false,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'boolean',
		default: defaultValue,
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
		description,
	};
}

/**
 * Helper function to create a collection field for additional/optional fields
 * @param displayName - Display name for the collection (e.g., 'Additional Fields')
 * @param name - Internal name for the collection (e.g., 'additionalFields')
 * @param resource - The resource type (can be string or array)
 * @param operations - Array of operations that use this collection
 * @param options - Array of field options within the collection
 * @param description - Collection description
 * @returns INodeProperties for the collection field
 */
export function makeCollectionField(
	displayName: string,
	name: string,
	resource: string | string[],
	operations: string[],
	options: INodeProperties[],
	description?: string,
): INodeProperties {
	return {
		displayName,
		name,
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: Array.isArray(resource) ? resource : [resource],
				operation: operations,
			},
		},
		options,
		description: description || `Optional fields for ${displayName.toLowerCase()}`,
	};
}
