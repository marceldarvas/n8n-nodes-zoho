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
} from './types';

export function throwOnErrorStatus(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    responseData: {
        code?: number;
        message?: string;
        data?: Array<{ status: string; message: string }>;
    },
) {
    // Check for error status in response
    if (responseData?.code && responseData.code !== 0) {
        throw new NodeOperationError(
            this.getNode(),
            `Zoho API error: ${responseData.message || 'Unknown error'}`,
        );
    }

    // Check for data-level errors
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
    } else {
        // console.log('Getting cached token');
    }
    return {api_domain, access_token, refresh_token, expires_in};
}

export async function zohoApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    baseURL: string,
    uri: string,
    body: IDataObject = {},
    qs: IDataObject = {},
) {
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
 */
export async function zohoSubscriptionsApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    uri: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    organizationId: string,
) {
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
 * Make an authenticated API request to Zoho Subscriptions and automatically paginate through all results.
 */
export async function zohoSubscriptionsApiRequestAllItems(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    organizationId: string,
    dataKey: string = 'data',
): Promise<any> {
    const returnData: IDataObject[] = [];

    let responseData;
    qs.page = 1;
    qs.per_page = qs.per_page || 200;

    do {
        responseData = await zohoSubscriptionsApiRequest.call(
            this,
            method,
            endpoint,
            body,
            qs,
            organizationId,
        );

        if (responseData[dataKey]) {
            returnData.push(...responseData[dataKey]);
        }

        qs.page = (qs.page as number) + 1;
    } while (
        responseData.page_context &&
        responseData.page_context.has_more_page === true
    );

    return returnData;
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

