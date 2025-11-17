import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getBiginBaseUrl, zohoBiginApiRequest } from './GenericFunctions';

import {
	pipelinesOperations,
	pipelinesFields,
	contactsOperations,
	contactsFields,
	accountsOperations,
	accountsFields,
	productsOperations,
	productsFields,
	tasksOperations,
	tasksFields,
	eventsOperations,
	eventsFields,
	notesOperations,
	notesFields,
} from './descriptions';

/**
 * Zoho Bigin Node
 * Integrates with Zoho Bigin CRM API for managing pipelines, contacts, accounts, products, tasks, events, and notes
 */
export class ZohoBigin implements INodeType {
	/**
	 * Metadata cache for performance optimization
	 * Caches field metadata and other rarely-changing data
	 */
	private static metadataCache: Map<string, { data: IDataObject; expiry: number }> = new Map();

	description: INodeTypeDescription = {
		displayName: 'Zoho Bigin',
		name: 'zohoBigin',
		icon: 'file:zoho.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Zoho Bigin CRM API',
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
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Pipeline',
						value: 'pipeline',
						description: 'Operations on pipeline records (deals)',
					},
					{
						name: 'Contact',
						value: 'contact',
						description: 'Operations on contacts',
					},
					{
						name: 'Account',
						value: 'account',
						description: 'Operations on companies/accounts',
					},
					{
						name: 'Product',
						value: 'product',
						description: 'Operations on products',
					},
					{
						name: 'Task',
						value: 'task',
						description: 'Operations on tasks',
					},
					{
						name: 'Event',
						value: 'event',
						description: 'Operations on calendar events',
					},
					{
						name: 'Note',
						value: 'note',
						description: 'Operations on notes',
					},
				],
				default: 'pipeline',
			},
			// Operations and fields for each resource
			...pipelinesOperations,
			...contactsOperations,
			...accountsOperations,
			...productsOperations,
			...tasksOperations,
			...eventsOperations,
			...notesOperations,
			...pipelinesFields,
			...contactsFields,
			...accountsFields,
			...productsFields,
			...tasksFields,
			...eventsFields,
			...notesFields,
		],
	};

	/**
	 * Main execution method
	 * Routes operations to appropriate resource handlers
	 */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials('zohoApi');
		const baseUrl = getBiginBaseUrl(credentials.accessTokenUrl as string);

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				let responseData: IDataObject | IDataObject[] = {};

				// Route to appropriate resource handler
				if (resource === 'pipeline') {
					responseData = await ZohoBigin.handlePipelineOperations(this, operation, i, baseUrl);
				} else if (resource === 'contact') {
					responseData = await ZohoBigin.handleContactOperations(this, operation, i, baseUrl);
				} else if (resource === 'account') {
					responseData = await ZohoBigin.handleAccountOperations(this, operation, i, baseUrl);
				} else if (resource === 'product') {
					responseData = await ZohoBigin.handleProductOperations(this, operation, i, baseUrl);
				} else if (resource === 'task') {
					responseData = await ZohoBigin.handleTaskOperations(this, operation, i, baseUrl);
				} else if (resource === 'event') {
					responseData = await ZohoBigin.handleEventOperations(this, operation, i, baseUrl);
				} else if (resource === 'note') {
					responseData = await ZohoBigin.handleNoteOperations(this, operation, i, baseUrl);
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unknown resource: ${resource}`,
					);
				}

				// Add response to return data
				if (Array.isArray(responseData)) {
					returnData.push(...responseData.map(item => ({
						json: item,
						pairedItem: { item: i },
					})));
				} else {
					returnData.push({
						json: responseData,
						pairedItem: { item: i },
					});
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}

	/**
	 * Build criteria string from filters for Zoho Bigin API
	 * Converts filter objects into Zoho API criteria format
	 *
	 * @param filters - Array of filter objects with field, operator, and value
	 * @returns Criteria string in Zoho format (e.g., "(Field:operator:value)")
	 */
	private static buildCriteriaString(filters: Array<{ field: string; operator: string; value?: string }>): string {
		const conditions: string[] = [];

		filters.forEach((filter) => {
			const { field, operator, value } = filter;
			let condition = '';

			switch (operator) {
				case 'equals':
					condition = `(${field}:equals:${value})`;
					break;
				case 'not_equals':
					condition = `(${field}:not_equals:${value})`;
					break;
				case 'contains':
					condition = `(${field}:contains:${value})`;
					break;
				case 'not_contains':
					// Zoho doesn't have direct not_contains, use NOT operator
					condition = `NOT (${field}:contains:${value})`;
					break;
				case 'starts_with':
					condition = `(${field}:starts_with:${value})`;
					break;
				case 'ends_with':
					// Zoho doesn't have direct ends_with, use regex-like pattern
					condition = `(${field}:ends_with:${value})`;
					break;
				case 'greater_than':
					condition = `(${field}:greater_than:${value})`;
					break;
				case 'less_than':
					condition = `(${field}:less_than:${value})`;
					break;
				case 'between':
					if (value && value.includes(',')) {
						const [min, max] = value.split(',').map(v => v.trim());
						condition = `(${field}:between:${min},${max})`;
					}
					break;
				case 'in':
					if (value) {
						const values = value.split(',').map(v => v.trim()).join(',');
						condition = `(${field}:in:${values})`;
					}
					break;
				case 'is_empty':
					condition = `(${field}:is_empty)`;
					break;
				case 'is_not_empty':
					condition = `NOT (${field}:is_empty)`;
					break;
				default:
					break;
			}

			if (condition) {
				conditions.push(condition);
			}
		});

		return conditions.join(' AND ');
	}

	/**
	 * Get cached metadata with automatic expiration
	 * Caches metadata for 1 hour to reduce API calls
	 *
	 * @param key - Cache key (e.g., 'fields:Contacts')
	 * @param fetcher - Function to fetch data if not cached or expired
	 * @returns Cached or freshly fetched data
	 */
	private static async getCachedMetadata(
		key: string,
		fetcher: () => Promise<IDataObject>,
	): Promise<IDataObject> {
		const cached = ZohoBigin.metadataCache.get(key);
		const now = Date.now();

		if (cached && cached.expiry > now) {
			return cached.data;
		}

		const data = await fetcher();
		ZohoBigin.metadataCache.set(key, {
			data,
			expiry: now + (60 * 60 * 1000), // 1 hour
		});

		return data;
	}

	/**
	 * Fetch all pages of data automatically
	 * Continues fetching until no more pages are available
	 *
	 * @param context - The IExecuteFunctions instance
	 * @param endpoint - The API endpoint to fetch from
	 * @param filters - Optional filters to apply
	 * @returns All records from all pages
	 */
	private static async fetchAllPages(
		context: IExecuteFunctions,
		endpoint: string,
		filters?: Array<{ field: string; operator: string; value?: string }>,
	): Promise<IDataObject[]> {
		let allData: IDataObject[] = [];
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const qs: IDataObject = {
				page,
				per_page: 200,
			};

			// Add filters if provided
			if (filters && filters.length > 0) {
				const criteria = ZohoBigin.buildCriteriaString(filters);
				if (criteria) {
					qs.criteria = criteria;
				}
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				endpoint,
				{},
				qs,
			);

			const data = response.data || [];
			allData = allData.concat(data);

			// Check if we got a full page (200 records), which means there might be more
			hasMore = data.length === 200;
			page++;

			// Rate limiting between pages
			if (hasMore) {
				await new Promise(resolve => setTimeout(resolve, 500));
			}
		}

		return allData;
	}

	/**
	 * Handle Pipeline (Deals) operations
	 * Operations: list, get, create, update, delete, search
	 *
	 * @param context - The IExecuteFunctions instance
	 * @param operation - The operation to perform
	 * @param itemIndex - The index of the current item being processed
	 * @param baseUrl - The base URL for the Bigin API
	 */
	static async handlePipelineOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listPipelines') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(
					context,
					'/Pipelines',
					filters.filter && filters.filter.length > 0 ? filters.filter : undefined,
				);
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const criteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (criteria) {
					qs.criteria = criteria;
				}
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Pipelines',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getPipeline') {
			const pipelineId = context.getNodeParameter('pipelineId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Pipelines/${pipelineId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createPipeline') {
			const dealName = context.getNodeParameter('dealName', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Deal_Name: dealName,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Pipelines',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updatePipeline') {
			const pipelineId = context.getNodeParameter('pipelineId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: pipelineId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Pipelines',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deletePipeline') {
			const pipelineId = context.getNodeParameter('pipelineId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Pipelines/${pipelineId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchPipelines') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex, '') as string;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			const criteria: string[] = [];

			// Add search term criteria if provided
			if (searchTerm) {
				criteria.push(`(Deal_Name:contains:${searchTerm})`);
			}

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const filterCriteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (filterCriteria) {
					criteria.push(filterCriteria);
				}
			}

			const qs: IDataObject = {};
			if (criteria.length > 0) {
				qs.criteria = criteria.join(' AND ');
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Pipelines/search',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'bulkCreatePipelines') {
			const pipelinesDataRaw = context.getNodeParameter('pipelinesData', itemIndex) as string;

			let pipelinesData: IDataObject[] = [];
			try {
				pipelinesData = JSON.parse(pipelinesDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data must be valid JSON array',
				);
			}

			if (!Array.isArray(pipelinesData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data must be an array',
				);
			}

			if (pipelinesData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data array cannot be empty',
				);
			}

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < pipelinesData.length; i += batchSize) {
				const batch = pipelinesData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'POST',
					'/Pipelines',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < pipelinesData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'bulkUpdatePipelines') {
			const pipelinesDataRaw = context.getNodeParameter('pipelinesData', itemIndex) as string;

			let pipelinesData: IDataObject[] = [];
			try {
				pipelinesData = JSON.parse(pipelinesDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data must be valid JSON array',
				);
			}

			if (!Array.isArray(pipelinesData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data must be an array',
				);
			}

			if (pipelinesData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Pipelines data array cannot be empty',
				);
			}

			// Validate that each pipeline has an ID
			pipelinesData.forEach((pipeline, index) => {
				if (!pipeline.id) {
					throw new NodeOperationError(
						context.getNode(),
						`Pipeline at index ${index} is missing required 'id' field`,
					);
				}
			});

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < pipelinesData.length; i += batchSize) {
				const batch = pipelinesData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'PUT',
					'/Pipelines',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < pipelinesData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'getFields') {
			// Use cached metadata to reduce API calls
			const cacheKey = 'fields:Pipelines';
			const result = await ZohoBigin.getCachedMetadata(cacheKey, async () => {
				const response = await zohoBiginApiRequest.call(
					context,
					'GET',
					'/settings/fields?module=Pipelines',
					{},
					{},
				);
				return { fields: response.fields || [] };
			});

			return result.fields as IDataObject[];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown pipeline operation: ${operation}`,
		);
	}

	/**
	 * Handle Contact operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleContactOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listContacts') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(
					context,
					'/Contacts',
					filters.filter && filters.filter.length > 0 ? filters.filter : undefined,
				);
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const criteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (criteria) {
					qs.criteria = criteria;
				}
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Contacts',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getContact') {
			const contactId = context.getNodeParameter('contactId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Contacts/${contactId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createContact') {
			const lastName = context.getNodeParameter('lastName', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Last_Name: lastName,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Contacts',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateContact') {
			const contactId = context.getNodeParameter('contactId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: contactId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Contacts',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteContact') {
			const contactId = context.getNodeParameter('contactId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Contacts/${contactId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchContacts') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex, '') as string;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			const criteria: string[] = [];

			// Add search term criteria if provided
			if (searchTerm) {
				criteria.push(`(Last_Name:contains:${searchTerm})`);
			}

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const filterCriteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (filterCriteria) {
					criteria.push(filterCriteria);
				}
			}

			const qs: IDataObject = {};
			if (criteria.length > 0) {
				qs.criteria = criteria.join(' AND ');
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Contacts/search',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'bulkCreateContacts') {
			const contactsDataRaw = context.getNodeParameter('contactsData', itemIndex) as string;

			let contactsData: IDataObject[] = [];
			try {
				contactsData = JSON.parse(contactsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data must be valid JSON array',
				);
			}

			if (!Array.isArray(contactsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data must be an array',
				);
			}

			if (contactsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data array cannot be empty',
				);
			}

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < contactsData.length; i += batchSize) {
				const batch = contactsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'POST',
					'/Contacts',
					body,
					{},
				);

				// Collect all results (both success and failure details)
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches to avoid API limits
				if (i + batchSize < contactsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'bulkUpdateContacts') {
			const contactsDataRaw = context.getNodeParameter('contactsData', itemIndex) as string;

			let contactsData: IDataObject[] = [];
			try {
				contactsData = JSON.parse(contactsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data must be valid JSON array',
				);
			}

			if (!Array.isArray(contactsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data must be an array',
				);
			}

			if (contactsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Contacts data array cannot be empty',
				);
			}

			// Validate that each contact has an ID
			contactsData.forEach((contact, index) => {
				if (!contact.id) {
					throw new NodeOperationError(
						context.getNode(),
						`Contact at index ${index} is missing required 'id' field`,
					);
				}
			});

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < contactsData.length; i += batchSize) {
				const batch = contactsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'PUT',
					'/Contacts',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < contactsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'getFields') {
			// Use cached metadata to reduce API calls
			const cacheKey = 'fields:Contacts';
			const result = await ZohoBigin.getCachedMetadata(cacheKey, async () => {
				const response = await zohoBiginApiRequest.call(
					context,
					'GET',
					'/settings/fields?module=Contacts',
					{},
					{},
				);
				return { fields: response.fields || [] };
			});

			return result.fields as IDataObject[];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown contact operation: ${operation}`,
		);
	}

	/**
	 * Handle Account (Company) operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleAccountOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listAccounts') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(
					context,
					'/Accounts',
					filters.filter && filters.filter.length > 0 ? filters.filter : undefined,
				);
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const criteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (criteria) {
					qs.criteria = criteria;
				}
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Accounts',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getAccount') {
			const accountId = context.getNodeParameter('accountId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Accounts/${accountId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createAccount') {
			const accountName = context.getNodeParameter('accountName', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Account_Name: accountName,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Accounts',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateAccount') {
			const accountId = context.getNodeParameter('accountId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: accountId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Accounts',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteAccount') {
			const accountId = context.getNodeParameter('accountId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Accounts/${accountId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchAccounts') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex, '') as string;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			const criteria: string[] = [];

			// Add search term criteria if provided
			if (searchTerm) {
				criteria.push(`(Account_Name:contains:${searchTerm})`);
			}

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const filterCriteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (filterCriteria) {
					criteria.push(filterCriteria);
				}
			}

			const qs: IDataObject = {};
			if (criteria.length > 0) {
				qs.criteria = criteria.join(' AND ');
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Accounts/search',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'bulkCreateAccounts') {
			const accountsDataRaw = context.getNodeParameter('accountsData', itemIndex) as string;

			let accountsData: IDataObject[] = [];
			try {
				accountsData = JSON.parse(accountsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data must be valid JSON array',
				);
			}

			if (!Array.isArray(accountsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data must be an array',
				);
			}

			if (accountsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data array cannot be empty',
				);
			}

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < accountsData.length; i += batchSize) {
				const batch = accountsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'POST',
					'/Accounts',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < accountsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'bulkUpdateAccounts') {
			const accountsDataRaw = context.getNodeParameter('accountsData', itemIndex) as string;

			let accountsData: IDataObject[] = [];
			try {
				accountsData = JSON.parse(accountsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data must be valid JSON array',
				);
			}

			if (!Array.isArray(accountsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data must be an array',
				);
			}

			if (accountsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Accounts data array cannot be empty',
				);
			}

			// Validate that each account has an ID
			accountsData.forEach((account, index) => {
				if (!account.id) {
					throw new NodeOperationError(
						context.getNode(),
						`Account at index ${index} is missing required 'id' field`,
					);
				}
			});

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < accountsData.length; i += batchSize) {
				const batch = accountsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'PUT',
					'/Accounts',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < accountsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'getFields') {
			// Use cached metadata to reduce API calls
			const cacheKey = 'fields:Accounts';
			const result = await ZohoBigin.getCachedMetadata(cacheKey, async () => {
				const response = await zohoBiginApiRequest.call(
					context,
					'GET',
					'/settings/fields?module=Accounts',
					{},
					{},
				);
				return { fields: response.fields || [] };
			});

			return result.fields as IDataObject[];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown account operation: ${operation}`,
		);
	}

	/**
	 * Handle Product operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleProductOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listProducts') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;
			const filters = context.getNodeParameter('filters', itemIndex, { filter: [] }) as {
				filter: Array<{ field: string; operator: string; value?: string }>;
			};

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(
					context,
					'/Products',
					filters.filter && filters.filter.length > 0 ? filters.filter : undefined,
				);
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			// Add advanced filters if provided
			if (filters.filter && filters.filter.length > 0) {
				const criteria = ZohoBigin.buildCriteriaString(filters.filter);
				if (criteria) {
					qs.criteria = criteria;
				}
			}

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Products',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getProduct') {
			const productId = context.getNodeParameter('productId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Products/${productId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createProduct') {
			const productName = context.getNodeParameter('productName', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Product_Name: productName,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Products',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateProduct') {
			const productId = context.getNodeParameter('productId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: productId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Products',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteProduct') {
			const productId = context.getNodeParameter('productId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Products/${productId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchProducts') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex) as string;
			const searchField = context.getNodeParameter('searchField', itemIndex, 'Product_Name') as string;

			const qs: IDataObject = {
				criteria: `(${searchField}:contains:${searchTerm})`,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Products/search',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'bulkCreateProducts') {
			const productsDataRaw = context.getNodeParameter('productsData', itemIndex) as string;

			let productsData: IDataObject[] = [];
			try {
				productsData = JSON.parse(productsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data must be valid JSON array',
				);
			}

			if (!Array.isArray(productsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data must be an array',
				);
			}

			if (productsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data array cannot be empty',
				);
			}

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < productsData.length; i += batchSize) {
				const batch = productsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'POST',
					'/Products',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < productsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'bulkUpdateProducts') {
			const productsDataRaw = context.getNodeParameter('productsData', itemIndex) as string;

			let productsData: IDataObject[] = [];
			try {
				productsData = JSON.parse(productsDataRaw);
			} catch (error) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data must be valid JSON array',
				);
			}

			if (!Array.isArray(productsData)) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data must be an array',
				);
			}

			if (productsData.length === 0) {
				throw new NodeOperationError(
					context.getNode(),
					'Products data array cannot be empty',
				);
			}

			// Validate that each product has an ID
			productsData.forEach((product, index) => {
				if (!product.id) {
					throw new NodeOperationError(
						context.getNode(),
						`Product at index ${index} is missing required 'id' field`,
					);
				}
			});

			// Bigin allows up to 100 records per request
			const batchSize = 100;
			const results: IDataObject[] = [];

			for (let i = 0; i < productsData.length; i += batchSize) {
				const batch = productsData.slice(i, i + batchSize);

				const body = {
					data: batch,
				};

				const response = await zohoBiginApiRequest.call(
					context,
					'PUT',
					'/Products',
					body,
					{},
				);

				// Collect all results
				if (response.data) {
					results.push(...response.data);
				}

				// Rate limiting: wait between batches
				if (i + batchSize < productsData.length) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			return results;

		} else if (operation === 'getFields') {
			// Use cached metadata to reduce API calls
			const cacheKey = 'fields:Products';
			const result = await ZohoBigin.getCachedMetadata(cacheKey, async () => {
				const response = await zohoBiginApiRequest.call(
					context,
					'GET',
					'/settings/fields?module=Products',
					{},
					{},
				);
				return { fields: response.fields || [] };
			});

			return result.fields as IDataObject[];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown product operation: ${operation}`,
		);
	}

	/**
	 * Handle Task operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleTaskOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listTasks') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(context, '/Tasks');
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Tasks',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getTask') {
			const taskId = context.getNodeParameter('taskId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Tasks/${taskId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createTask') {
			const subject = context.getNodeParameter('subject', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Subject: subject,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Tasks',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateTask') {
			const taskId = context.getNodeParameter('taskId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: taskId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Tasks',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteTask') {
			const taskId = context.getNodeParameter('taskId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Tasks/${taskId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchTasks') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex) as string;
			const searchField = context.getNodeParameter('searchField', itemIndex, 'Subject') as string;

			const qs: IDataObject = {
				criteria: `(${searchField}:contains:${searchTerm})`,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Tasks/search',
				{},
				qs,
			);

			return response.data || [];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown task operation: ${operation}`,
		);
	}

	/**
	 * Handle Event (Calendar) operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleEventOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listEvents') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(context, '/Events');
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Events',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getEvent') {
			const eventId = context.getNodeParameter('eventId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Events/${eventId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createEvent') {
			const eventTitle = context.getNodeParameter('eventTitle', itemIndex) as string;
			const startDateTime = context.getNodeParameter('startDateTime', itemIndex) as string;
			const endDateTime = context.getNodeParameter('endDateTime', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Event_Title: eventTitle,
						Start_DateTime: startDateTime,
						End_DateTime: endDateTime,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Events',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateEvent') {
			const eventId = context.getNodeParameter('eventId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: eventId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Events',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteEvent') {
			const eventId = context.getNodeParameter('eventId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Events/${eventId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchEvents') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex) as string;
			const searchField = context.getNodeParameter('searchField', itemIndex, 'Event_Title') as string;

			const qs: IDataObject = {
				criteria: `(${searchField}:contains:${searchTerm})`,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Events/search',
				{},
				qs,
			);

			return response.data || [];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown event operation: ${operation}`,
		);
	}

	/**
	 * Handle Note operations
	 * Operations: list, get, create, update, delete, search
	 */
	static async handleNoteOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		if (operation === 'listNotes') {
			const returnAll = context.getNodeParameter('returnAll', itemIndex, false) as boolean;

			// Use optimized fetchAllPages helper if returnAll is true
			if (returnAll) {
				return await ZohoBigin.fetchAllPages(context, '/Notes');
			}

			// Otherwise, fetch single page with limit
			const limit = context.getNodeParameter('limit', itemIndex, 50) as number;
			const qs: IDataObject = {
				page: 1,
				per_page: limit,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Notes',
				{},
				qs,
			);

			return response.data || [];

		} else if (operation === 'getNote') {
			const noteId = context.getNodeParameter('noteId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				`/Notes/${noteId}`,
				{},
				{},
			);

			return response.data?.[0] || {};

		} else if (operation === 'createNote') {
			const noteTitle = context.getNodeParameter('noteTitle', itemIndex) as string;
			const noteContent = context.getNodeParameter('noteContent', itemIndex) as string;
			const additionalFields = context.getNodeParameter('additionalFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						Note_Title: noteTitle,
						Note_Content: noteContent,
						...additionalFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'POST',
				'/Notes',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'updateNote') {
			const noteId = context.getNodeParameter('noteId', itemIndex) as string;
			const updateFields = context.getNodeParameter('updateFields', itemIndex, {}) as IDataObject;

			const body = {
				data: [
					{
						id: noteId,
						...updateFields,
					},
				],
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'PUT',
				'/Notes',
				body,
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'deleteNote') {
			const noteId = context.getNodeParameter('noteId', itemIndex) as string;

			const response = await zohoBiginApiRequest.call(
				context,
				'DELETE',
				`/Notes/${noteId}`,
				{},
				{},
			);

			return response.data?.[0]?.details || {};

		} else if (operation === 'searchNotes') {
			const searchTerm = context.getNodeParameter('searchTerm', itemIndex) as string;
			const searchField = context.getNodeParameter('searchField', itemIndex, 'Note_Title') as string;

			const qs: IDataObject = {
				criteria: `(${searchField}:contains:${searchTerm})`,
			};

			const response = await zohoBiginApiRequest.call(
				context,
				'GET',
				'/Notes/search',
				{},
				qs,
			);

			return response.data || [];
		}

		throw new NodeOperationError(
			context.getNode(),
			`Unknown note operation: ${operation}`,
		);
	}
}
