import type {
	IExecuteFunctions,
	INode,
	IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import {
	throwOnErrorStatus,
	zohoApiRequest,
	zohoSubscriptionsApiRequest,
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
		let mockRequest: jest.Mock;

		beforeEach(() => {
			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					oauthTokenData: {
						access_token: 'test-access-token',
						refresh_token: 'test-refresh-token',
						api_domain: 'https://www.zohoapis.com',
						expires_in: 0, // Set to 0 to skip token refresh in tests
					},
					accessTokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
					clientId: 'test-client-id',
					clientSecret: 'test-client-secret',
					redirectUri: 'https://test.redirect.uri',
				}),
				helpers: {
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		it('should make a successful API request with proper headers', async () => {
			const mockResponse = {
				data: [{ status: 'success', id: '123' }],
			};
			mockRequest.mockResolvedValue(mockResponse);

			const result = await zohoApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.com',
				'/api/v2/users',
				{},
				{ page: 1 },
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					baseURL: 'https://www.zohoapis.com',
					uri: '/api/v2/users',
					headers: {
						Authorization: 'Zoho-oauthtoken test-access-token',
					},
					form: { page: 1 },
				}),
			);
		});

		it('should throw error when request fails', async () => {
			const mockError = new Error('Network error');
			mockRequest.mockRejectedValue(mockError);

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
			const mockErrorResponse = {
				data: [{ status: 'error', message: 'Invalid request' }],
			};
			mockRequest.mockResolvedValue(mockErrorResponse);

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
		let mockRequest: jest.Mock;

		beforeEach(() => {
			// Suppress console.log for cleaner test output
			jest.spyOn(console, 'log').mockImplementation(() => {});

			mockRequest = jest.fn();
			mockContext = {
				getNode: () => mockNode,
				getCredentials: jest.fn().mockResolvedValue({
					oauthTokenData: {
						access_token: 'test-access-token',
						refresh_token: 'test-refresh-token',
						api_domain: 'https://www.zohoapis.eu',
						expires_in: 0, // Set to 0 to skip token refresh in tests
					},
					accessTokenUrl: 'https://accounts.zoho.eu/oauth/v2/token',
					clientId: 'test-client-id',
					clientSecret: 'test-client-secret',
					redirectUri: 'https://test.redirect.uri',
				}),
				helpers: {
					request: mockRequest,
				},
			} as unknown as IExecuteFunctions;
		});

		afterEach(() => {
			jest.restoreAllMocks();
		});

		it('should make a successful Subscriptions API request with organization header', async () => {
			const mockResponse = {
				code: 0,
				message: 'success',
				customers: [{ customer_id: '123', display_name: 'Test Customer' }],
			};
			mockRequest.mockResolvedValue(mockResponse);

			const result = await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.eu/billing/v1/customers',
				{},
				{ page: 1 },
				'org-123',
			);

			expect(result).toEqual(mockResponse);
			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'GET',
					uri: 'https://www.zohoapis.eu/billing/v1/customers',
					headers: {
						Authorization: 'Zoho-oauthtoken test-access-token',
						'X-com-zoho-subscriptions-organizationid': 'org-123',
					},
					json: true,
					qs: { page: 1 },
				}),
			);
		});

		it('should include request body when provided', async () => {
			const mockResponse = {
				code: 0,
				message: 'success',
				customer: { customer_id: '456' },
			};
			mockRequest.mockResolvedValue(mockResponse);

			const requestBody = {
				display_name: 'New Customer',
				email: 'test@example.com',
			};

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'POST',
				'https://www.zohoapis.eu/billing/v1/customers',
				requestBody,
				{},
				'org-123',
			);

			expect(mockRequest).toHaveBeenCalledWith(
				expect.objectContaining({
					method: 'POST',
					body: requestBody,
				}),
			);
		});

		it('should not include qs when query string is empty', async () => {
			const mockResponse = { code: 0 };
			mockRequest.mockResolvedValue(mockResponse);

			await zohoSubscriptionsApiRequest.call(
				mockContext,
				'GET',
				'https://www.zohoapis.eu/billing/v1/products',
				{},
				{},
				'org-123',
			);

			expect(mockRequest).toHaveBeenCalledWith(
				expect.not.objectContaining({
					qs: expect.anything(),
				}),
			);
		});

		it('should throw error when request fails', async () => {
			const mockError = new Error('API error');
			mockRequest.mockRejectedValue(mockError);

			await expect(
				zohoSubscriptionsApiRequest.call(
					mockContext,
					'GET',
					'https://www.zohoapis.eu/billing/v1/customers',
					{},
					{},
					'org-123',
				),
			).rejects.toThrow();
		});

		it('should handle different HTTP methods correctly', async () => {
			const methods: IHttpRequestMethods[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
			const mockResponse = { code: 0 };
			mockRequest.mockResolvedValue(mockResponse);

			for (const method of methods) {
				await zohoSubscriptionsApiRequest.call(
					mockContext,
					method,
					'https://www.zohoapis.eu/billing/v1/test',
					{},
					{},
					'org-123',
				);

				expect(mockRequest).toHaveBeenCalledWith(
					expect.objectContaining({
						method,
					}),
				);
			}
		});
	});
});
