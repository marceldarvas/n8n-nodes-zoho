import type {
	IExecuteFunctions,
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { zohoApiRequest } from './GenericFunctions';

/**
 * Zoho Bigin Node
 *
 * Provides integration with Zoho Bigin - a lightweight CRM for small businesses.
 * Supports CRUD operations for Contacts, Deals, Products, and Activities.
 *
 * @see https://www.bigin.com/developer/docs/apis/v2/
 */
export class ZohoBigin implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoho Bigin',
		name: 'zohoBigin',
		icon: 'file:zoho.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Zoho Bigin API - Lightweight CRM for small businesses',
		defaults: {
			name: 'Zoho Bigin',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'zohoApi',
				required: true,
			},
		],
		properties: [
			// Resource Selection
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Contact',
						value: 'contact',
						description: 'Operations on contacts',
					},
				],
				default: 'contact',
				description: 'The resource to operate on',
			},

			// ==========================================
			//         Contact Operations
			// ==========================================
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['contact'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new contact',
						action: 'Create a contact',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete a contact',
						action: 'Delete a contact',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Retrieve a contact by ID',
						action: 'Get a contact',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List all contacts',
						action: 'List contacts',
					},
					{
						name: 'Search',
						value: 'search',
						description: 'Search contacts by criteria',
						action: 'Search contacts',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an existing contact',
						action: 'Update a contact',
					},
				],
				default: 'create',
				description: 'The operation to perform',
			},

			// ==========================================
			//         Contact Parameters
			// ==========================================

			// Contact ID (for get, update, delete)
			{
				displayName: 'Contact ID',
				name: 'contactId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['get', 'update', 'delete'],
					},
				},
				default: '',
				description: 'The ID of the contact',
				placeholder: '4876876000000624001',
			},

			// JSON Data (for create, update)
			{
				displayName: 'JSON Data',
				name: 'jsonData',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['create', 'update'],
					},
				},
				default: '{\n  "First_Name": "John",\n  "Last_Name": "Doe",\n  "Email": "john.doe@example.com",\n  "Phone": "+1-555-0123"\n}',
				description: 'Contact data in JSON format. For create operations, will be automatically wrapped in data array if not already wrapped.',
				placeholder: '{"First_Name": "John", "Last_Name": "Doe", "Email": "john@example.com"}',
			},

			// Search Criteria (for search)
			{
				displayName: 'Search Criteria',
				name: 'criteria',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['search'],
					},
				},
				default: '',
				description: 'Search criteria in COQL format. Example: (Email:equals:john@example.com) or (First_Name:starts_with:John)',
				placeholder: '(Email:equals:john@example.com)',
			},

			// ==========================================
			//         List/Search Parameters
			// ==========================================

			// Page Number
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				typeOptions: {
					minValue: 1,
				},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['list', 'search'],
					},
				},
				default: 1,
				description: 'Page number for pagination',
			},

			// Records Per Page
			{
				displayName: 'Per Page',
				name: 'per_page',
				type: 'number',
				typeOptions: {
					minValue: 1,
					maxValue: 200,
				},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['list', 'search'],
					},
				},
				default: 200,
				description: 'Number of records per page (max 200)',
			},

			// Sort Order
			{
				displayName: 'Sort Order',
				name: 'sort_order',
				type: 'options',
				options: [
					{
						name: 'Ascending',
						value: 'asc',
					},
					{
						name: 'Descending',
						value: 'desc',
					},
				],
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['list'],
					},
				},
				default: 'asc',
				description: 'Sort order for the results',
			},

			// Sort By
			{
				displayName: 'Sort By',
				name: 'sort_by',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['list'],
					},
				},
				default: 'Created_Time',
				description: 'Field to sort by (e.g., Created_Time, Modified_Time, First_Name)',
				placeholder: 'Created_Time',
			},

			// Additional Fields (optional)
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['contact'],
						operation: ['list', 'search'],
					},
				},
				options: [
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						description: 'Comma-separated list of fields to retrieve. Leave empty for all fields.',
						placeholder: 'First_Name,Last_Name,Email,Phone',
					},
					{
						displayName: 'Approved',
						name: 'approved',
						type: 'options',
						options: [
							{
								name: 'Both',
								value: 'both',
							},
							{
								name: 'True',
								value: 'true',
							},
							{
								name: 'False',
								value: 'false',
							},
						],
						default: 'both',
						description: 'Filter by approval status',
					},
					{
						displayName: 'Converted',
						name: 'converted',
						type: 'options',
						options: [
							{
								name: 'Both',
								value: 'both',
							},
							{
								name: 'True',
								value: 'true',
							},
							{
								name: 'False',
								value: 'false',
							},
						],
						default: 'both',
						description: 'Filter by conversion status',
					},
				],
			},
		],
	};

	/**
	 * Execute the node
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// Bigin API base URL (v2 is recommended)
		const baseURL = 'https://www.zohoapis.com/bigin/v2';

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: IDataObject = {};

				// ==========================================
				//         Contact Operations
				// ==========================================
				if (resource === 'contact') {
					// Create Contact
					if (operation === 'create') {
						const jsonData = this.getNodeParameter('jsonData', i) as string;
						let body: IDataObject;

						try {
							body = JSON.parse(jsonData);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in 'JSON Data' parameter: ${error.message}`,
								{ itemIndex: i },
							);
						}

						// Ensure data is wrapped in array format as required by Bigin API
						const requestBody = body.data ? body : { data: [body] };

						responseData = await zohoApiRequest.call(
							this,
							'POST',
							baseURL,
							'/Contacts',
							requestBody,
						);
					}

					// Get Contact
					else if (operation === 'get') {
						const contactId = this.getNodeParameter('contactId', i) as string;

						responseData = await zohoApiRequest.call(
							this,
							'GET',
							baseURL,
							`/Contacts/${contactId}`,
						);
					}

					// Update Contact
					else if (operation === 'update') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const jsonData = this.getNodeParameter('jsonData', i) as string;
						let body: IDataObject;

						try {
							body = JSON.parse(jsonData);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in 'JSON Data' parameter: ${error.message}`,
								{ itemIndex: i },
							);
						}

						// Ensure data is wrapped in array format
						const requestBody = body.data ? body : { data: [body] };

						responseData = await zohoApiRequest.call(
							this,
							'PUT',
							baseURL,
							`/Contacts/${contactId}`,
							requestBody,
						);
					}

					// Delete Contact
					else if (operation === 'delete') {
						const contactId = this.getNodeParameter('contactId', i) as string;

						responseData = await zohoApiRequest.call(
							this,
							'DELETE',
							baseURL,
							`/Contacts/${contactId}`,
						);
					}

					// List Contacts
					else if (operation === 'list') {
						const page = this.getNodeParameter('page', i, 1) as number;
						const perPage = this.getNodeParameter('per_page', i, 200) as number;
						const sortOrder = this.getNodeParameter('sort_order', i, 'asc') as string;
						const sortBy = this.getNodeParameter('sort_by', i, 'Created_Time') as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const qs: IDataObject = {
							page,
							per_page: perPage,
							sort_order: sortOrder,
							sort_by: sortBy,
						};

						// Add additional fields if provided
						if (additionalFields.fields) {
							qs.fields = additionalFields.fields;
						}
						if (additionalFields.approved && additionalFields.approved !== 'both') {
							qs.approved = additionalFields.approved;
						}
						if (additionalFields.converted && additionalFields.converted !== 'both') {
							qs.converted = additionalFields.converted;
						}

						responseData = await zohoApiRequest.call(
							this,
							'GET',
							baseURL,
							'/Contacts',
							{},
							qs,
						);
					}

					// Search Contacts
					else if (operation === 'search') {
						const criteria = this.getNodeParameter('criteria', i) as string;
						const page = this.getNodeParameter('page', i, 1) as number;
						const perPage = this.getNodeParameter('per_page', i, 200) as number;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						const qs: IDataObject = {
							criteria,
							page,
							per_page: perPage,
						};

						// Add additional fields if provided
						if (additionalFields.fields) {
							qs.fields = additionalFields.fields;
						}
						if (additionalFields.approved && additionalFields.approved !== 'both') {
							qs.approved = additionalFields.approved;
						}
						if (additionalFields.converted && additionalFields.converted !== 'both') {
							qs.converted = additionalFields.converted;
						}

						responseData = await zohoApiRequest.call(
							this,
							'GET',
							baseURL,
							'/Contacts/search',
							{},
							qs,
						);
					}
				}

				// Return the response data
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map((item) => ({ json: item })));
				} else {
					returnData.push({ json: responseData });
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
