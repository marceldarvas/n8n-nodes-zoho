
import {
   type IExecuteFunctions,
   type IDataObject,
   type INodeExecutionData,
   type INodeType,
   type INodeTypeDescription,
   NodeConnectionType,
} from 'n8n-workflow';

import { zohoApiRequest } from './GenericFunctions';

export class ZohoTasks implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoho Tasks',
		name: 'zohoTasks',
		icon: 'file:zoho.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Consume Zoho Tasks API',
		defaults: {
			name: 'Zoho Tasks',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'zohoApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Add Group Task', value: 'addGroupTask' },
					{ name: 'Add Personal Task', value: 'addPersonalTask' },
					{ name: 'Add Project', value: 'addProject' },
					{ name: 'Get All Group Tasks', value: 'getGroupTasks' },
					{ name: 'Get All Personal Tasks', value: 'getPersonalTasks' },
					{ name: 'Get All Assigned Tasks', value: 'getAssignedTasks' },
					{ name: 'Get All Created Tasks', value: 'getCreatedTasks' },
					{ name: 'Get Group Task', value: 'getGroupTask' },
					{ name: 'Get Personal Task', value: 'getPersonalTask' },
					{ name: 'Get Group Subtasks', value: 'getGroupSubtasks' },
					{ name: 'Get Personal Subtasks', value: 'getPersonalSubtasks' },
					{ name: 'Get All Group Projects', value: 'getGroupProjects' },
					{ name: 'Get Project Tasks', value: 'getProjectTasks' },
					{ name: 'Get All Groups', value: 'getGroups' },
					{ name: 'Get Group Members', value: 'getGroupMembers' },
					{ name: 'Change Task Title', value: 'updateTaskTitle' },
					{ name: 'Change Task Description', value: 'updateTaskDescription' },
					{ name: 'Change Task Priority', value: 'updateTaskPriority' },
					{ name: 'Change Task Status', value: 'updateTaskStatus' },
					{ name: 'Change Task Project', value: 'updateTaskProject' },
					{ name: 'Change Task Assignee', value: 'updateTaskAssignee' },
					{ name: 'Set/Change Task Due Date', value: 'updateTaskDueDate' },
					{ name: 'Set/Change Task Reminder', value: 'updateTaskReminder' },
					{ name: 'Set/Change Task Reminder Based On Due Date', value: 'updateTaskReminderBasedOnDueDate' },
					{ name: 'Set/Change Recurring Task', value: 'updateRecurringTask' },
					{ name: 'Edit Project', value: 'editProject' },
					{ name: 'Delete Project', value: 'deleteProject' },
					{ name: 'Delete Group Task', value: 'deleteGroupTask' },
					{ name: 'Delete Personal Task', value: 'deletePersonalTask' },
				],
				default: 'addGroupTask',
			},
			{
				displayName: 'Group ID',
				name: 'groupId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'addGroupTask','addProject','getGroupTasks','getGroupSubtasks','getGroupTask','getGroupProjects',
							'getProjectTasks','updateTaskTitle','updateTaskDescription','updateTaskPriority','updateTaskStatus',
							'updateTaskProject','updateTaskAssignee','updateTaskDueDate','updateTaskReminder',
							'updateTaskReminderBasedOnDueDate','updateRecurringTask','editProject','deleteProject',
							'deleteGroupTask','getGroupMembers',
						],
					},
				},
				description: 'The Zoho group ID (zgid)',
			},
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'getGroupTask','getPersonalTask','getGroupSubtasks','getPersonalSubtasks',
							'updateTaskTitle','updateTaskDescription','updateTaskPriority','updateTaskStatus',
							'updateTaskProject','updateTaskAssignee','updateTaskDueDate','updateTaskReminder',
							'updateTaskReminderBasedOnDueDate','updateRecurringTask','deleteGroupTask',
							'deletePersonalTask',
						],
					},
				},
				description: 'The ID of the task',
			},
			{
				displayName: 'Project ID',
				name: 'projectId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['addProject','getProjectTasks','editProject','deleteProject'],
					},
				},
				description: 'The ID of the project',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						operation: ['getGroupTasks','getPersonalTasks','getProjectTasks'],
					},
				},
				description: 'Status to filter tasks',
			},
			{
				displayName: 'JSON Data',
				name: 'jsonData',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: [
							'addGroupTask','addPersonalTask','addProject','updateTaskTitle','updateTaskDescription',
							'updateTaskPriority','updateTaskStatus','updateTaskProject','updateTaskAssignee',
							'updateTaskDueDate','updateTaskReminder','updateTaskReminderBasedOnDueDate',
							'updateRecurringTask','editProject',
						],
					},
				},
				description: 'Raw JSON string for the request body',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			/**
			 * Add a task to a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink5
			 *
			 * Creates a new task within a specified Zoho group.
			 * Requires: groupId, jsonData - JSON object with task details (name, description, priority, etc.)
			 */
			if (operation === 'addGroupTask') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const jsonData = this.getNodeParameter('jsonData', i) as string;
				const body = JSON.parse(jsonData) as IDataObject;
				const responseData = await zohoApiRequest.call(this, 'POST', `/api/tasks/groups/${groupId}`, body);
				returnData.push(responseData as IDataObject);

			/**
			 * Add a personal task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink1
			 *
			 * Creates a new personal task (not associated with a group).
			 * Requires: jsonData - JSON object with task details (name, description, priority, etc.)
			 */
			} else if (operation === 'addPersonalTask') {
				const jsonData = this.getNodeParameter('jsonData', i) as string;
				const body = JSON.parse(jsonData) as IDataObject;
				const responseData = await zohoApiRequest.call(this, 'POST', '/api/tasks/me', body);
				returnData.push(responseData as IDataObject);

			/**
			 * Add a project to a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink11
			 *
			 * Creates a new project within a specified Zoho group.
			 * Requires: groupId, jsonData - JSON object with project details (name, description, etc.)
			 */
			} else if (operation === 'addProject') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const jsonData = this.getNodeParameter('jsonData', i) as string;
				const body = JSON.parse(jsonData) as IDataObject;
				const responseData = await zohoApiRequest.call(this, 'POST', `/api/tasks/groups/${groupId}/projects`, body);
				returnData.push(responseData as IDataObject);

			/**
			 * Get all tasks in a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink7
			 *
			 * Retrieves all tasks within a specified group.
			 * Requires: groupId
			 * Optional: status - Filter by task status
			 */
			} else if (operation === 'getGroupTasks') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const status = this.getNodeParameter('status', i) as string;
				const qs: IDataObject = {};
				if (status) {
					qs.status = status;
				}
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}`, {}, qs);
				returnData.push(responseData as IDataObject);

			/**
			 * Get all personal tasks
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink3
			 *
			 * Retrieves all personal tasks for the authenticated user.
			 * Optional: status - Filter by task status
			 */
			} else if (operation === 'getPersonalTasks') {
				const status = this.getNodeParameter('status', i) as string;
				const qs: IDataObject = {};
				if (status) {
					qs.status = status;
				}
				const responseData = await zohoApiRequest.call(this, 'GET', '/api/tasks/me', {}, qs);
				returnData.push(responseData as IDataObject);

			/**
			 * Get all tasks assigned to the user
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Retrieves all tasks assigned to the authenticated user across all groups and projects.
			 */
			} else if (operation === 'getAssignedTasks') {
				const responseData = await zohoApiRequest.call(this, 'GET', '/api/tasks', {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get all tasks created by the user
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Retrieves all tasks created by the authenticated user.
			 */
			} else if (operation === 'getCreatedTasks') {
				const responseData = await zohoApiRequest.call(this, 'GET', '/api/tasks', {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get a specific task from a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink8
			 *
			 * Retrieves detailed information about a specific task within a group.
			 * Requires: groupId, taskId
			 */
			} else if (operation === 'getGroupTask') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}/${taskId}`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get a specific personal task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink4
			 *
			 * Retrieves detailed information about a specific personal task.
			 * Requires: taskId
			 */
			} else if (operation === 'getPersonalTask') {
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/me/${taskId}`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get subtasks of a group task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink9
			 *
			 * Retrieves all subtasks for a specific task within a group.
			 * Requires: groupId, taskId
			 */
			} else if (operation === 'getGroupSubtasks') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}/${taskId}/subtasks`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get subtasks of a personal task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Retrieves all subtasks for a specific personal task.
			 * Requires: taskId
			 */
			} else if (operation === 'getPersonalSubtasks') {
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/me/${taskId}/subtasks`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get all projects in a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink13
			 *
			 * Retrieves all projects within a specified group.
			 * Requires: groupId
			 */
			} else if (operation === 'getGroupProjects') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}/projects`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get all tasks in a project
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink14
			 *
			 * Retrieves all tasks within a specific project.
			 * Requires: groupId, projectId
			 * Optional: status - Filter by task status
			 */
			} else if (operation === 'getProjectTasks') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const projectId = this.getNodeParameter('projectId', i) as string;
				const status = this.getNodeParameter('status', i) as string;
				const qs: IDataObject = {};
				if (status) {
					qs.status = status;
				}
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}/projects/${projectId}`, {}, qs);
				returnData.push(responseData as IDataObject);

			/**
			 * Get all groups
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink10
			 *
			 * Retrieves all Zoho groups accessible to the authenticated user.
			 */
			} else if (operation === 'getGroups') {
				const responseData = await zohoApiRequest.call(this, 'GET', '/api/tasks/groups', {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Get all members in a group
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Retrieves all members of a specified group.
			 * Requires: groupId
			 */
			} else if (operation === 'getGroupMembers') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'GET', `/api/tasks/groups/${groupId}/members`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Update task properties
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink6
			 *
			 * Updates various properties of a group task including:
			 * - Title
			 * - Description
			 * - Priority
			 * - Status
			 * - Project assignment
			 * - Assignee
			 * - Due date
			 * - Reminders (time-based or due date-based)
			 * - Recurring settings
			 *
			 * Requires: groupId, taskId, jsonData - JSON object with fields to update
			 */
			} else if (
				operation === 'updateTaskTitle' ||
				operation === 'updateTaskDescription' ||
				operation === 'updateTaskPriority' ||
				operation === 'updateTaskStatus' ||
				operation === 'updateTaskProject' ||
				operation === 'updateTaskAssignee' ||
				operation === 'updateTaskDueDate' ||
				operation === 'updateTaskReminder' ||
				operation === 'updateTaskReminderBasedOnDueDate' ||
				operation === 'updateRecurringTask'
			) {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const taskId = this.getNodeParameter('taskId', i) as string;
				const jsonData = this.getNodeParameter('jsonData', i) as string;
				const body = JSON.parse(jsonData) as IDataObject;
				const responseData = await zohoApiRequest.call(this, 'PUT', `/api/tasks/groups/${groupId}/${taskId}`, body);
				returnData.push(responseData as IDataObject);

			/**
			 * Edit a project
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink12
			 *
			 * Updates project details with the provided JSON data.
			 * Requires: groupId, projectId, jsonData - JSON object with fields to update
			 */
			} else if (operation === 'editProject') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const projectId = this.getNodeParameter('projectId', i) as string;
				const jsonData = this.getNodeParameter('jsonData', i) as string;
				const body = JSON.parse(jsonData) as IDataObject;
				const responseData = await zohoApiRequest.call(this, 'PUT', `/api/tasks/groups/${groupId}/projects/${projectId}`, body);
				returnData.push(responseData as IDataObject);

			/**
			 * Delete a project
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Permanently deletes a project from a group.
			 * Requires: groupId, projectId
			 */
			} else if (operation === 'deleteProject') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const projectId = this.getNodeParameter('projectId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'DELETE', `/api/tasks/groups/${groupId}/projects/${projectId}`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Delete a group task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html
			 *
			 * Permanently deletes a task from a group.
			 * Requires: groupId, taskId
			 */
			} else if (operation === 'deleteGroupTask') {
				const groupId = this.getNodeParameter('groupId', i) as string;
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'DELETE', `/api/tasks/groups/${groupId}/${taskId}`, {}, {});
				returnData.push(responseData as IDataObject);

			/**
			 * Delete a personal task
			 *
			 * @see https://www.zoho.com/projects/help/rest-api/zoho-tasks-rest-api.html#alink2
			 *
			 * Permanently deletes a personal task.
			 * Requires: taskId
			 */
			} else if (operation === 'deletePersonalTask') {
				const taskId = this.getNodeParameter('taskId', i) as string;
				const responseData = await zohoApiRequest.call(this, 'DELETE', `/api/tasks/me/${taskId}`, {}, {});
				returnData.push(responseData as IDataObject);
			}
		}

		// Parse any raw JSON string responses into objects
		const parsedData = returnData.map(item =>
			typeof item === 'string'
				? JSON.parse(item)
				: (item as IDataObject),
		) as IDataObject[];
		return [this.helpers.returnJsonArray(parsedData)];
	}
}
