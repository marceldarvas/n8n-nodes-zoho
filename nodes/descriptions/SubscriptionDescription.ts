import type { INodeProperties } from 'n8n-workflow';
import { paginationFields } from './SharedFields';

export const subscriptionOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: { resource: ['subscription'] },
		},
		options: [
			{ name: 'List', value: 'listSubscriptions', description: 'List all subscriptions' },
			{ name: 'Get', value: 'getSubscription', description: 'Get a subscription' },
			{ name: 'Create', value: 'createSubscription', description: 'Create a subscription' },
			{ name: 'Update', value: 'updateSubscription', description: 'Update a subscription' },
			{ name: 'Cancel', value: 'cancelSubscription', description: 'Cancel a subscription' },
		],
		default: 'listSubscriptions',
	},
];

export const subscriptionFields: INodeProperties[] = [
	{
		displayName: 'Subscription ID',
		name: 'subscriptionId',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['getSubscription', 'updateSubscription', 'cancelSubscription'],
			},
		},
		description: 'ID of the subscription',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'fixedCollection',
		default: { filter: [] },
		typeOptions: {
			multipleValues: true,
		},
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['subscription'],
				operation: ['listSubscriptions'],
			},
		},
		options: [
			{
				displayName: 'Filter',
				name: 'filter',
				values: [
					{
						displayName: 'Field Name',
						name: 'filterBy',
						type: 'options',
						options: [
							{ name: 'Search Text', value: 'search_text' },
							{ name: 'Subscription Number Contains', value: 'subscription_number_contains' },
							{ name: 'Reference Contains', value: 'reference_contains' },
							{ name: 'Subscription Status', value: 'filter_by' },
						],
						default: 'search_text',
						description: 'Field to filter by',
					},
					{
						displayName: 'Value',
						name: 'filterValue',
						type: 'string',
						default: '',
						description: 'Value to filter the selected field by',
						displayOptions: {
							show: {
								filterBy: [
									'search_text',
									'subscription_number_contains',
									'reference_contains',
								],
							},
						},
					},
					{
						displayName: 'Subscription Status',
						name: 'filterValue',
						type: 'options',
						options: [
							{ name: 'All', value: 'SubscriptionStatus.All' },
							{ name: 'In Progress', value: 'SubscriptionStatus.IN_PROGRESS' },
							{ name: 'Trial', value: 'SubscriptionStatus.TRIAL' },
							{ name: 'Future', value: 'SubscriptionStatus.FUTURE' },
							{ name: 'Live', value: 'SubscriptionStatus.LIVE' },
							{ name: 'Unpaid', value: 'SubscriptionStatus.UNPAID' },
							{ name: 'Past Due', value: 'SubscriptionStatus.PAST_DUE' },
							{ name: 'Non‑Renewing', value: 'SubscriptionStatus.NON_RENEWING' },
							{ name: 'Cancelled', value: 'SubscriptionStatus.CANCELLED' },
							{
								name: 'Cancelled From Dunning',
								value: 'SubscriptionStatus.CANCELLED_FROM_DUNNING',
							},
							{ name: 'Expired', value: 'SubscriptionStatus.EXPIRED' },
							{ name: 'Creation Failed', value: 'SubscriptionStatus.CREATION_FAILED' },
							{ name: 'Trial Expired', value: 'SubscriptionStatus.TRIAL_EXPIRED' },
							{ name: 'Cancelled This Month', value: 'SubscriptionStatus.CANCELLED_THIS_MONTH' },
							{ name: 'Cancelled Last Month', value: 'SubscriptionStatus.CANCELLED_LAST_MONTH' },
							{ name: 'Paused', value: 'SubscriptionStatus.PAUSED' },
							{ name: 'Having Unbilled', value: 'SubscriptionStatus.HAVING_UNBILLED' },
						],
						default: 'SubscriptionStatus.All',
						description: 'Subscription status to filter by',
						displayOptions: {
							show: {
								filterBy: ['filter_by'],
							},
						},
					},
				],
			},
		],
	},
	...paginationFields('subscription', 'listSubscriptions'),
];
