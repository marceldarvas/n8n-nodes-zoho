import type {
	IExecuteFunctions,
	INode,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	throwOnErrorStatus,
	zohoApiRequest,
	zohoSubscriptionsApiRequest,
	zohoCalendarApiRequest,
	zohoBiginApiRequest,
	getBiginBaseUrl,
} from '../GenericFunctions';

describe('GenericFunctions', () => {
	describe('throwOnErrorStatus', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		const mockContext = {
			getNode: () => mockNode,
		} as unknown as IExecuteFunctions;

		it('should throw NodeOperationError when response contains error status in data array', () => {
			const errorResponse = {
				data: [
					{
						status: 'error',
						message: 'Invalid customer ID',
					},
				],
			};

			expect(() => {
				throwOnErrorStatus.call(mockContext, errorResponse);
			}).toThrow(NodeOperationError);
		});

		it('should not throw when response data status is not error', () => {
			const successResponse = {
				data: [
					{
						status: 'success',
						message: 'Operation completed',
					},
				],
			};

			expect(() => {
				throwOnErrorStatus.call(mockContext, successResponse);
			}).not.toThrow();
		});

		it('should not throw when response has no data array', () => {
			const responseWithoutData = {
				code: 0,
				message: 'Success',
			};

			expect(() => {
				throwOnErrorStatus.call(mockContext, responseWithoutData);
			}).not.toThrow();
		});

		it('should not throw when response data array is empty', () => {
			const responseWithEmptyData = {
				data: [],
			};

			expect(() => {
				throwOnErrorStatus.call(mockContext, responseWithEmptyData);
			}).not.toThrow();
		});
	});

	describe('zohoApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn(); // must never be called: raw request = token-storm regression
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should delegate auth to requestOAuth2 with the zohoApi credential', async () => {
			const mockResponse = { data: [{ status: 'success', id: '123' }] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com',
				'/api/v2/users',
				{},
				{ page: 1 },
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options).toEqual(
				expect.objectContaining({
					method: 'GET',
					baseURL: 'https://www.zohoapis.com',
					uri: '/api/v2/users',
					form: { page: 1 },
				}),
			);
			expect(options.headers?.Authorization).toBeUndefined();
			expect(oAuth2Options).toBeUndefined();
		});

		it('should never call the raw request helper (token-refresh storm regression)', async () => {
			mockRequestOAuth2.mockResolvedValue({ data: [] });

			await zohoApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com',
				'/api/v2/users',
			);

			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should throw error when request fails', async () => {
			mockRequestOAuth2.mockRejectedValue(new Error('Network error'));

			await expect(
				zohoApiRequest.call(
					mockContext,
					'GET',
					'https://www.zohoapis.com',
					'/api/v2/users',
				),
			).rejects.toThrow();
		});

		it('should throw error when response contains error status', async () => {
			mockRequestOAuth2.mockResolvedValue({
				data: [{ status: 'error', message: 'Invalid request' }],
			});

			await expect(
				zohoApiRequest.call(
					mockContext,
					'POST',
					'https://www.zohoapis.com',
					'/api/v2/users',
				),
			).rejects.toThrow();
		});
	});

	describe('zohoSubscriptionsApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should delegate auth to requestOAuth2 and keep the organization header', async () => {
			const mockResponse = { code: 0, subscriptions: [] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com/billing/v1/subscriptions',
				{},
				{ page: 1 },
				'700000123',
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options).toEqual(
				expect.objectContaining({
					method: 'GET',
					uri: 'https://www.zohoapis.com/billing/v1/subscriptions',
					qs: { page: 1 },
					json: true,
				}),
			);
			expect(options.headers).toEqual({
				'X-com-zoho-subscriptions-organizationid': '700000123',
			});
			expect(oAuth2Options).toBeUndefined();
			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should include request body when provided', async () => {
			mockRequestOAuth2.mockResolvedValue({ code: 0 });

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'POST',
				'https://www.zohoapis.com/billing/v1/subscriptions',
				{ plan: { plan_code: 'basic' } },
				{},
				'700000123',
			);

			const [, options] = mockRequestOAuth2.mock.calls[0];
			expect(options.body).toEqual({ plan: { plan_code: 'basic' } });
		});

		it('should not include qs when query string is empty', async () => {
			mockRequestOAuth2.mockResolvedValue({ code: 0 });

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com/billing/v1/plans',
				{},
				{},
				'700000123',
			);

			const [, options] = mockRequestOAuth2.mock.calls[0];
			expect(options.qs).toBeUndefined();
		});

		it('should throw error when request fails', async () => {
			mockRequestOAuth2.mockRejectedValue(new Error('boom'));

			await expect(
				zohoSubscriptionsApiRequest.call(
					mockContext,
					'GET',
					'https://www.zohoapis.com/billing/v1/plans',
					{},
					{},
					'700000123',
				),
			).rejects.toThrow();
		});
	});

	describe('zohoBiginApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zohoBigin',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.eu/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should call requestOAuth2 with the region-mapped Bigin base URL', async () => {
			const mockResponse = { data: [{ status: 'success', id: '1' }] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts');

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options.url).toBe('https://www.zohoapis.eu/bigin/v1/Contacts');
			expect(options.headers?.Authorization).toBeUndefined();
			expect(options.headers?.['Content-Type']).toBe('application/json');
			expect(oAuth2Options).toBeUndefined();
			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should retry on 429 and succeed on the second attempt', async () => {
			const rateLimitError = Object.assign(new Error('rate limited'), {
				statusCode: 429,
				response: { headers: { 'retry-after': '0' } },
			});
			mockRequestOAuth2
				.mockRejectedValueOnce(rateLimitError)
				.mockResolvedValueOnce({ data: [{ status: 'success' }] });

			const result = await zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts');

			expect(mockRequestOAuth2).toHaveBeenCalledTimes(2);
			expect(result).toEqual({ data: [{ status: 'success' }] });
		});

		it('should not retry on non-429 client errors', async () => {
			const badRequest = Object.assign(new Error('bad request'), { statusCode: 400 });
			mockRequestOAuth2.mockRejectedValue(badRequest);

			await expect(
				zohoBiginApiRequest.call(mockContext, 'GET', '/Contacts'),
			).rejects.toThrow();
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
		});
	});

	describe('zohoCalendarApiRequest', () => {
		const mockNode: INode = {
			id: 'test-node-id',
			name: 'Test Node',
			type: 'n8n-nodes-zoho.zoho',
			typeVersion: 1,
			position: [0, 0],
			parameters: {},
		};

		let mockContext: IExecuteFunctions;
		let mockRequestOAuth2: jest.Mock;
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequestOAuth2 = jest.fn();
			mockRequest = jest.fn(); // must never be called: raw request = token-storm regression
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
				}),
				helpers: {
					requestOAuth2: mockRequestOAuth2,
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should delegate auth to requestOAuth2 with the zohoApi credential and correct options shape', async () => {
			const mockResponse = { events: [] };
			mockRequestOAuth2.mockResolvedValue(mockResponse);

			const result = await zohoCalendarApiRequest.call(
				mockContext,
				'GET',
				'/calendars/primary/events',
				{},
				{ range: 'today' },
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequestOAuth2).toHaveBeenCalledTimes(1);
			const [credentialType, options, oAuth2Options] = mockRequestOAuth2.mock.calls[0];
			expect(credentialType).toBe('zohoApi');
			expect(options).toEqual(
				expect.objectContaining({
					method: 'GET',
					url: 'https://calendar.zoho.com/api/v1/calendars/primary/events',
					qs: { range: 'today' },
					json: true,
				}),
			);
			// Authorization header must NOT be set — n8n injects it via requestOAuth2
			expect(options.headers?.Authorization).toBeUndefined();
			// Content-Type should be preserved
			expect(options.headers?.['Content-Type']).toBe('application/json');
			expect(oAuth2Options).toBeUndefined();
		});

		it('should never call the raw request helper (token-refresh storm regression)', async () => {
			mockRequestOAuth2.mockResolvedValue({});

			await zohoCalendarApiRequest.call(
				mockContext,
				'GET',
				'/calendars/primary/events',
			);

			expect(mockRequest).not.toHaveBeenCalled();
		});

		it('should include request body when provided', async () => {
			mockRequestOAuth2.mockResolvedValue({});

			await zohoCalendarApiRequest.call(
				mockContext,
				'POST',
				'/calendars/primary/events',
				{ title: 'Meeting', start: '2026-07-07T10:00:00Z' },
				{},
			);

			const [, options] = mockRequestOAuth2.mock.calls[0];
			expect(options.body).toEqual({ title: 'Meeting', start: '2026-07-07T10:00:00Z' });
		});

		it('should throw error when requestOAuth2 rejects', async () => {
			mockRequestOAuth2.mockRejectedValue(new Error('Network error'));

			await expect(
				zohoCalendarApiRequest.call(
					mockContext,
					'GET',
					'/calendars/primary/events',
				),
			).rejects.toThrow();
		});
	});

	describe('getBiginBaseUrl', () => {
		const testCases = [
			{
				input: 'https://accounts.zoho.com/oauth/v2/token',
				expected: 'https://www.zohoapis.com/bigin/v1',
				region: 'US',
			},
			{
				input: 'https://accounts.zoho.eu/oauth/v2/token',
				expected: 'https://www.zohoapis.eu/bigin/v1',
				region: 'EU',
			},
			{
				input: 'https://accounts.zoho.com.au/oauth/v2/token',
				expected: 'https://www.zohoapis.com.au/bigin/v1',
				region: 'AU',
			},
			{
				input: 'https://accounts.zoho.in/oauth/v2/token',
				expected: 'https://www.zohoapis.in/bigin/v1',
				region: 'IN',
			},
			{
				input: 'https://accounts.zoho.com.cn/oauth/v2/token',
				expected: 'https://www.zohoapis.com.cn/bigin/v1',
				region: 'CN',
			},
			{
				input: 'https://unknown.domain.com/oauth/v2/token',
				expected: 'https://www.zohoapis.com/bigin/v1',
				region: 'fallback to US',
			},
		];

		testCases.forEach(({ input, expected, region }) => {
			it(`should return correct base URL for ${region}`, () => {
				expect(getBiginBaseUrl(input)).toBe(expected);
			});
		});
	});
});
