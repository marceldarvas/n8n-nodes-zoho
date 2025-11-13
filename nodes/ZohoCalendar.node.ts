
import {
	type IExecuteFunctions,
	type IDataObject,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import { zohoCalendarApiRequest } from './GenericFunctions';

export class ZohoCalendar implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoho Calendar',
		name: 'zohoCalendar',
		icon: 'file:zoho.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume Zoho Calendar API',
		defaults: {
			name: 'Zoho Calendar',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'zohoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Event',
						value: 'event',
					},
					{
						name: 'Calendar',
						value: 'calendar',
					},
				],
				default: 'event',
			},
			// Event Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['event'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a new event',
						action: 'Create an event',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete an event',
						action: 'Delete an event',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get an event',
						action: 'Get an event',
					},
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many events',
						action: 'Get many events',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update an event',
						action: 'Update an event',
					},
				],
				default: 'create',
			},
			// Calendar Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['calendar'],
					},
				},
				options: [
					{
						name: 'Get Many',
						value: 'getAll',
						description: 'Get many calendars',
						action: 'Get many calendars',
					},
				],
				default: 'getAll',
			},
			// Calendar UID field (required for most operations)
			{
				displayName: 'Calendar UID',
				name: 'calendarUid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['create', 'delete', 'get', 'getAll', 'update'],
					},
				},
				default: '',
				description: 'The unique identifier of the calendar',
			},
			// Event UID field (required for get, update, delete)
			{
				displayName: 'Event UID',
				name: 'eventUid',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['delete', 'get', 'update'],
					},
				},
				default: '',
				description: 'The unique identifier of the event',
			},
			// Event Title (required for create)
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'The title of the event',
			},
			// Event Start Date/Time (required for create)
			{
				displayName: 'Start Date/Time',
				name: 'startDateTime',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'Start date/time in format yyyyMMddTHHmmssZ (e.g., 20241028T103000Z) for specific time, or yyyyMMdd (e.g., 20241028) for all-day event',
			},
			// Event End Date/Time (required for create)
			{
				displayName: 'End Date/Time',
				name: 'endDateTime',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['create'],
					},
				},
				default: '',
				description: 'End date/time in format yyyyMMddTHHmmssZ (e.g., 20241028T153000Z) for specific time, or yyyyMMdd (e.g., 20241028) for all-day event',
			},
			// Additional Fields for Create/Update
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['create', 'update'],
					},
				},
				options: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'The title of the event (for update)',
					},
					{
						displayName: 'Start Date/Time',
						name: 'startDateTime',
						type: 'string',
						default: '',
						description: 'Start date/time in format yyyyMMddTHHmmssZ',
					},
					{
						displayName: 'End Date/Time',
						name: 'endDateTime',
						type: 'string',
						default: '',
						description: 'End date/time in format yyyyMMddTHHmmssZ',
					},
					{
						displayName: 'Location',
						name: 'location',
						type: 'string',
						default: '',
						description: 'Location of the event',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						typeOptions: {
							rows: 4,
						},
						default: '',
						description: 'Description of the event',
					},
					{
						displayName: 'All Day Event',
						name: 'isallday',
						type: 'boolean',
						default: false,
						description: 'Whether this is an all-day event',
					},
					{
						displayName: 'Timezone',
						name: 'timezone',
						type: 'string',
						default: 'UTC',
						description: 'Timezone for the event',
					},
					{
						displayName: 'Reminder',
						name: 'reminder',
						type: 'string',
						default: '',
						description: 'Reminder time in minutes before event',
					},
					{
						displayName: 'Attendees',
						name: 'attendees',
						type: 'string',
						default: '',
						description: 'Comma-separated list of attendee email addresses',
					},
					{
						displayName: 'ETag',
						name: 'etag',
						type: 'string',
						default: '',
						description: 'ETag value from previous GET request (required for update)',
					},
				],
			},
			// Filters for Get Many Events
			{
				displayName: 'Filters',
				name: 'filters',
				type: 'collection',
				placeholder: 'Add Filter',
				default: {},
				displayOptions: {
					show: {
						resource: ['event'],
						operation: ['getAll'],
					},
				},
				options: [
					{
						displayName: 'Range Start',
						name: 'rangeStart',
						type: 'string',
						default: '',
						description: 'Start date for range in UNIX timestamp format (milliseconds)',
					},
					{
						displayName: 'Range End',
						name: 'rangeEnd',
						type: 'string',
						default: '',
						description: 'End date for range in UNIX timestamp format (milliseconds). Range must not exceed 31 days.',
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 50,
						description: 'Maximum number of events to return',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'event') {
					if (operation === 'create') {
						// Create Event
						const calendarUid = this.getNodeParameter('calendarUid', i) as string;
						const title = this.getNodeParameter('title', i) as string;
						const startDateTime = this.getNodeParameter('startDateTime', i) as string;
						const endDateTime = this.getNodeParameter('endDateTime', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {
							title,
							dateandtime: {
								start: startDateTime,
								end: endDateTime,
							},
						};

						// Add additional fields
						if (additionalFields.location) {
							body.location = additionalFields.location;
						}
						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.isallday !== undefined) {
							body.isallday = additionalFields.isallday;
						}
						if (additionalFields.timezone) {
							body.timezone = additionalFields.timezone;
						}
						if (additionalFields.reminder) {
							body.reminder = additionalFields.reminder;
						}
						if (additionalFields.attendees) {
							const attendeesStr = additionalFields.attendees as string;
							body.attendees = attendeesStr.split(',').map(email => ({ email: email.trim() }));
						}

						const responseData = await zohoCalendarApiRequest.call(
							this,
							'POST',
							`/calendars/${calendarUid}/events`,
							body,
						);
						returnData.push(responseData as IDataObject);

					} else if (operation === 'delete') {
						// Delete Event
						const calendarUid = this.getNodeParameter('calendarUid', i) as string;
						const eventUid = this.getNodeParameter('eventUid', i) as string;

						const responseData = await zohoCalendarApiRequest.call(
							this,
							'DELETE',
							`/calendars/${calendarUid}/events/${eventUid}`,
							{},
						);
						returnData.push(responseData as IDataObject);

					} else if (operation === 'get') {
						// Get Event
						const calendarUid = this.getNodeParameter('calendarUid', i) as string;
						const eventUid = this.getNodeParameter('eventUid', i) as string;

						const responseData = await zohoCalendarApiRequest.call(
							this,
							'GET',
							`/calendars/${calendarUid}/events/${eventUid}`,
							{},
						);
						returnData.push(responseData as IDataObject);

					} else if (operation === 'getAll') {
						// Get Many Events
						const calendarUid = this.getNodeParameter('calendarUid', i) as string;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const qs: IDataObject = {};

						if (filters.rangeStart && filters.rangeEnd) {
							qs.range = JSON.stringify({
								start: filters.rangeStart,
								end: filters.rangeEnd,
							});
						}

						const responseData = await zohoCalendarApiRequest.call(
							this,
							'GET',
							`/calendars/${calendarUid}/events`,
							{},
							qs,
						);

						// Handle response - it might be an array or object with events array
						if (Array.isArray(responseData)) {
							returnData.push(...responseData);
						} else if (responseData && typeof responseData === 'object' && 'events' in responseData) {
							const events = (responseData as IDataObject).events as IDataObject[];
							returnData.push(...events);
						} else {
							returnData.push(responseData as IDataObject);
						}

					} else if (operation === 'update') {
						// Update Event
						const calendarUid = this.getNodeParameter('calendarUid', i) as string;
						const eventUid = this.getNodeParameter('eventUid', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

						const body: IDataObject = {};

						// Build update body from additional fields
						if (additionalFields.title) {
							body.title = additionalFields.title;
						}
						if (additionalFields.startDateTime && additionalFields.endDateTime) {
							body.dateandtime = {
								start: additionalFields.startDateTime,
								end: additionalFields.endDateTime,
							};
						}
						if (additionalFields.location) {
							body.location = additionalFields.location;
						}
						if (additionalFields.description) {
							body.description = additionalFields.description;
						}
						if (additionalFields.isallday !== undefined) {
							body.isallday = additionalFields.isallday;
						}
						if (additionalFields.timezone) {
							body.timezone = additionalFields.timezone;
						}
						if (additionalFields.reminder) {
							body.reminder = additionalFields.reminder;
						}
						if (additionalFields.attendees) {
							const attendeesStr = additionalFields.attendees as string;
							body.attendees = attendeesStr.split(',').map(email => ({ email: email.trim() }));
						}
						if (additionalFields.etag) {
							body.etag = additionalFields.etag;
						}

						const responseData = await zohoCalendarApiRequest.call(
							this,
							'PUT',
							`/calendars/${calendarUid}/events/${eventUid}`,
							body,
						);
						returnData.push(responseData as IDataObject);
					}
				} else if (resource === 'calendar') {
					if (operation === 'getAll') {
						// Get All Calendars
						const responseData = await zohoCalendarApiRequest.call(
							this,
							'GET',
							'/calendars',
							{},
						);

						// Handle response - it might be an array or object with calendars array
						if (Array.isArray(responseData)) {
							returnData.push(...responseData);
						} else if (responseData && typeof responseData === 'object' && 'calendars' in responseData) {
							const calendars = (responseData as IDataObject).calendars as IDataObject[];
							returnData.push(...calendars);
						} else {
							returnData.push(responseData as IDataObject);
						}
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
