import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getBiginBaseUrl } from './GenericFunctions';
// TODO: Import when implementing operations
// import { zohoBiginApiRequest } from './GenericFunctions';

// TODO: Import description files once Phase 2 is complete
// import {
// 	pipelinesOperations,
// 	pipelinesFields,
// 	contactsOperations,
// 	contactsFields,
// 	accountsOperations,
// 	accountsFields,
// 	productsOperations,
// 	productsFields,
// 	tasksOperations,
// 	tasksFields,
// 	eventsOperations,
// 	eventsFields,
// 	notesOperations,
// 	notesFields,
// } from './descriptions';

/**
 * Zoho Bigin Node
 * Integrates with Zoho Bigin CRM API for managing pipelines, contacts, accounts, products, tasks, events, and notes
 */
export class ZohoBigin implements INodeType {
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
			// TODO: Add operation definitions and fields from description files (Phase 2)
			// ...pipelinesOperations,
			// ...contactsOperations,
			// ...accountsOperations,
			// ...productsOperations,
			// ...tasksOperations,
			// ...eventsOperations,
			// ...notesOperations,
			// ...pipelinesFields,
			// ...contactsFields,
			// ...accountsFields,
			// ...productsFields,
			// ...tasksFields,
			// ...eventsFields,
			// ...notesFields,
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
				const nodeInstance = this as unknown as ZohoBigin;
				if (resource === 'pipeline') {
					responseData = await nodeInstance.handlePipelineOperations(this, operation, i, baseUrl);
				} else if (resource === 'contact') {
					responseData = await nodeInstance.handleContactOperations(this, operation, i, baseUrl);
				} else if (resource === 'account') {
					responseData = await nodeInstance.handleAccountOperations(this, operation, i, baseUrl);
				} else if (resource === 'product') {
					responseData = await nodeInstance.handleProductOperations(this, operation, i, baseUrl);
				} else if (resource === 'task') {
					responseData = await nodeInstance.handleTaskOperations(this, operation, i, baseUrl);
				} else if (resource === 'event') {
					responseData = await nodeInstance.handleEventOperations(this, operation, i, baseUrl);
				} else if (resource === 'note') {
					responseData = await nodeInstance.handleNoteOperations(this, operation, i, baseUrl);
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
	 * Handle Pipeline (Deals) operations
	 * Operations: list, get, create, update, delete, search
	 *
	 * @param context - The IExecuteFunctions instance
	 * @param operation - The operation to perform
	 * @param itemIndex - The index of the current item being processed
	 * @param baseUrl - The base URL for the Bigin API
	 */
	private handlePipelineOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement pipeline operations
		// See Phase 3 documentation for implementation details
		throw new NodeOperationError(
			context.getNode(),
			`Pipeline operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Contact operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleContactOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement contact operations
		throw new NodeOperationError(
			context.getNode(),
			`Contact operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Account (Company) operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleAccountOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement account operations
		throw new NodeOperationError(
			context.getNode(),
			`Account operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Product operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleProductOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement product operations
		throw new NodeOperationError(
			context.getNode(),
			`Product operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Task operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleTaskOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement task operations
		throw new NodeOperationError(
			context.getNode(),
			`Task operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Event (Calendar) operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleEventOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement event operations
		throw new NodeOperationError(
			context.getNode(),
			`Event operation '${operation}' not implemented yet`,
		);
	}

	/**
	 * Handle Note operations
	 * Operations: list, get, create, update, delete, search
	 */
	private handleNoteOperations(
		context: IExecuteFunctions,
		operation: string,
		itemIndex: number,
		baseUrl: string,
	): Promise<IDataObject | IDataObject[]> {
		// TODO: Implement note operations
		throw new NodeOperationError(
			context.getNode(),
			`Note operation '${operation}' not implemented yet`,
		);
	}
}
