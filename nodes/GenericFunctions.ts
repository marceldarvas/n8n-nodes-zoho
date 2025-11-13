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
        data?: ZohoApiErrorData[];
        code?: number;
        message?: string;
    },
): void {
    // Check for data-level errors (array format)
    if (responseData?.data?.[0]?.status === 'error') {
        throw new NodeOperationError(
            this.getNode(),
            `Zoho API error: ${responseData.data[0].message || 'Unknown error'}`,
        );
    }

    // Check for top-level error codes (non-zero code indicates error)
    if (responseData?.code && responseData.code !== 0) {
        throw new NodeOperationError(
            this.getNode(),
            `Zoho API error (code ${responseData.code}): ${responseData.message || 'Unknown error'}`,
        );
    }
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
    } else {
        // console.log('Getting cached token');
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
    console.log('Subscription Request Options',options);
    try {
        const responseData = await this.helpers.request!(options);
        console.log(responseData);
        return responseData;
    } catch (error) {
        throw new NodeApiError(this.getNode(), error as JsonObject);
    }
}

