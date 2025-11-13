import type {
    IExecuteFunctions,
    IHookFunctions,
    IDataObject,
    ILoadOptionsFunctions,
    JsonObject,
    IHttpRequestMethods,
    IRequestOptions,
} from 'n8n-workflow';
import {NodeApiError, NodeOperationError} from 'n8n-workflow';

import type {
    ZohoOAuth2ApiCredentials,
    ZohoApiErrorData,
} from './types';

/**
 * Check Zoho API response for error status and throw appropriate error
 * @param responseData - The API response data to check
 * @throws {NodeOperationError} When the response contains an error status
 */
export function throwOnErrorStatus(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    responseData: {
        code?: number;
        message?: string;
        data?: ZohoApiErrorData[];
    },
): void {
    // Check for top-level error codes (non-zero code indicates error)
    if (responseData?.code && responseData.code !== 0) {
        throw new NodeOperationError(
            this.getNode(),
            `Zoho API error (code ${responseData.code}): ${responseData.message || 'Unknown error'}`,
        );
    }

    // Check for data-level errors (array format)
    if (responseData?.data?.[0]?.status === 'error') {
        throw new NodeOperationError(
            this.getNode(),
            responseData.data[0].message || 'API returned error status',
        );
    }
}

/**
 * Map Zoho OAuth2 token URL to the appropriate Subscriptions API base URL.
 * Supports all Zoho regions: US, EU, AU, IN, CN.
 *
 * @param accessTokenUrl - The OAuth2 token URL from credentials
 * @returns The corresponding Subscriptions API base URL
 */
export function getSubscriptionsBaseUrl(accessTokenUrl: string): string {
    const urlMap: { [key: string]: string } = {
        'https://accounts.zoho.com/oauth/v2/token': 'https://www.zohoapis.com/billing/v1',
        'https://accounts.zoho.eu/oauth/v2/token': 'https://www.zohoapis.eu/billing/v1',
        'https://accounts.zoho.com.au/oauth/v2/token': 'https://www.zohoapis.com.au/billing/v1',
        'https://accounts.zoho.in/oauth/v2/token': 'https://www.zohoapis.in/billing/v1',
        'https://accounts.zoho.com.cn/oauth/v2/token': 'https://www.zohoapis.com.cn/billing/v1',
    };

    return urlMap[accessTokenUrl] || urlMap['https://accounts.zoho.com/oauth/v2/token'];
}

/**
 * Retrieve and refresh Zoho OAuth2 token data.
 */
async function getAccessTokenData(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
): Promise<{
    api_domain: string;
    access_token: string;
    refresh_token: string;
    expires_in: number // seconds, 3600 default
}> {
    const credentials = await this.getCredentials<ZohoOAuth2ApiCredentials>('zohoApi');
    if (!credentials.oauthTokenData) {
        throw new NodeOperationError(this.getNode(), 'Missing Zoho OAuth2 token data in credentials.');
    }
    let {api_domain, access_token, refresh_token, expires_in} = credentials.oauthTokenData;
    if (expires_in > 0) {
        const urlObject: IRequestOptions = {
            method: 'POST',
            url: credentials.accessTokenUrl,
            form: {
                grant_type: 'refresh_token',
                refresh_token,
                client_id: credentials.clientId,
                client_secret: credentials.clientSecret,
                redirect_uri: credentials.redirectUri,
            },
            json: true,
        };
        const tokenResponse = await this.helpers.request(urlObject);
        access_token = tokenResponse.access_token;
        refresh_token = tokenResponse.refresh_token || refresh_token;
        api_domain = tokenResponse.api_domain;
        expires_in = tokenResponse.expires_in;
    }
    return {api_domain, access_token, refresh_token, expires_in};
}

/**
 * Make an authenticated API request to Zoho APIs (Mail, Tasks, Sheets, etc.)
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param baseURL - Base URL for the API endpoint
 * @param uri - URI path for the specific endpoint
 * @param body - Request body data
 * @param qs - Query string parameters
 * @returns Promise resolving to the API response data
 * @throws {NodeApiError} When the API request fails
 */
export async function zohoApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    baseURL: string,
    uri: string,
    body: IDataObject = {},
    qs: IDataObject = {},
): Promise<IDataObject> {
    const {access_token} = await getAccessTokenData.call(this);
    const options: IRequestOptions = {
        method,
        baseURL,
        uri,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
        },
        // json: false,
        form: qs  // grant_type: 'refresh_token',
    };
    /*
    if (Object.keys(qs).length) {
        options.qs = qs;
    }
    if (Object.keys(body).length) {
        options.body = {data: [body]};
    }

     */
    try {
        const responseData = await this.helpers.request!(options);
        throwOnErrorStatus.call(this, responseData as IDataObject);
        return responseData;
    } catch (error) {
        const args = (error).cause?.data
            ? {
                message: (error).cause.data.message || 'The Zoho API returned an error.',
                description: JSON.stringify((error).cause.data, null, 2),
            }
            : undefined;
        throw new NodeApiError(this.getNode(), error as JsonObject, args);
    }
}

/**
 * Make an authenticated API request to Zoho Subscriptions (Billing) API.
 * Automatically includes the organization ID header required by the Subscriptions API.
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param uri - Full URI for the API endpoint (including base URL)
 * @param body - Request body data
 * @param qs - Query string parameters
 * @param organizationId - Zoho Subscriptions organization ID (required header)
 * @returns Promise resolving to the API response data
 * @throws {NodeApiError} When the API request fails
 * @see https://www.zoho.com/subscriptions/api/v1/
 */
export async function zohoSubscriptionsApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    uri: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    organizationId: string,
): Promise<IDataObject> {
    const {access_token} = await getAccessTokenData.call(this);
    const options: IRequestOptions = {
        method,
        uri,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            'X-com-zoho-subscriptions-organizationid': organizationId,
        },
        json: true,
    };
    if (Object.keys(qs).length) {
        options.qs = qs;
    }
    if (Object.keys(body).length) {
        options.body = body;
    }
    try {
        const responseData = await this.helpers.request!(options);
        throwOnErrorStatus.call(this, responseData);
        return responseData;
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}

/**
 * Make an authenticated API request to Zoho Calendar API.
 */
export async function zohoCalendarApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
) {
    const {access_token} = await getAccessTokenData.call(this);

    // Zoho Calendar API base URL
    const baseUrl = 'https://calendar.zoho.com/api/v1';

    const options: IRequestOptions = {
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            'Content-Type': 'application/json',
        },
        json: true,
    };

    if (Object.keys(qs).length) {
        options.qs = qs;
    }

    if (Object.keys(body).length) {
        options.body = body;
    }

    try {
        const responseData = await this.helpers.request!(options);
        return responseData;
    } catch (error) {
        const errorData = (error as any).cause?.data;
        const args = errorData
            ? {
                message: errorData.message || 'The Zoho Calendar API returned an error.',
                description: JSON.stringify(errorData, null, 2),
            }
            : undefined;
        throw new NodeApiError(this.getNode(), error as JsonObject, args);
    }
}
