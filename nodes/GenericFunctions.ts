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
 * Interface for objects with n8n logger support
 */
interface WithLogger {
    logger: {
        log: (level: string, message: string, meta?: unknown) => void;
        warn: (message: string, meta?: unknown) => void;
    };
}

/**
 * Type guard to check if context has a logger property
 */
function hasLogger(context: unknown): context is WithLogger {
    if (typeof context !== 'object' || context === null || !('logger' in context)) {
        return false;
    }

    const contextWithLogger = context as { logger?: unknown };
    const logger = contextWithLogger.logger;

    return (
        typeof logger === 'object' &&
        logger !== null &&
        'log' in logger &&
        'warn' in logger &&
        typeof (logger as any).log === 'function' &&
        typeof (logger as any).warn === 'function'
    );
}

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
 * Map Zoho OAuth2 token URL to the appropriate Bigin API base URL.
 * Supports all Zoho regions: US, EU, AU, IN, CN.
 *
 * @param accessTokenUrl - The OAuth2 token URL from credentials
 * @returns The corresponding Bigin API base URL
 */
export function getBiginBaseUrl(accessTokenUrl: string): string {
    const urlMap: { [key: string]: string } = {
        'https://accounts.zoho.com/oauth/v2/token': 'https://www.zohoapis.com/bigin/v1',
        'https://accounts.zoho.eu/oauth/v2/token': 'https://www.zohoapis.eu/bigin/v1',
        'https://accounts.zoho.com.au/oauth/v2/token': 'https://www.zohoapis.com.au/bigin/v1',
        'https://accounts.zoho.in/oauth/v2/token': 'https://www.zohoapis.in/bigin/v1',
        'https://accounts.zoho.com.cn/oauth/v2/token': 'https://www.zohoapis.com.cn/bigin/v1',
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

/**
 * Make an authenticated API request to Zoho Bigin CRM API.
 * Bigin API follows the CRM v2 API structure with JSON request/response format.
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint - API endpoint path (e.g., '/Pipelines', '/Contacts/{id}')
 * @param body - Request body data
 * @param qs - Query string parameters
 * @param headers - Additional headers to include in the request
 * @param additionalOptions - Additional request options (formData, encoding, json, etc.)
 * @returns Promise resolving to the API response data
 * @throws {NodeApiError} When the API request fails
 * @see https://www.zoho.com/bigin/developer/docs/api/v1/
 */
/**
 * Interface for operation metrics tracking
 */
export interface OperationMetrics {
    operation: string;
    endpoint: string;
    method: string;
    duration: number;
    success: boolean;
    retryCount: number;
    recordCount?: number;
    timestamp: Date;
}

/**
 * Log operation metrics for monitoring and debugging
 * @param context - n8n execution context (optional, for logger access)
 * @param metrics - Operation metrics to log
 */
function logMetrics(
    context: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | undefined,
    metrics: OperationMetrics,
): void {
    // Only log if duration is significant or if operation failed
    if (metrics.duration > 1000 || !metrics.success || metrics.retryCount > 0) {
        const logMessage = {
            level: metrics.success ? 'info' : 'error',
            message: 'Bigin API operation',
            ...metrics,
        };

        // Use n8n's logger if available, otherwise fall back to console
        if (hasLogger(context)) {
            context.logger.log(logMessage.level, logMessage.message, logMessage);
        } else {
            console.log(JSON.stringify(logMessage));
        }
    }
}

/**
 * Execute an HTTP request with automatic retry logic for rate limiting and transient errors.
 * Implements exponential backoff strategy for retries.
 *
 * @param context - n8n execution context
 * @param options - HTTP request options
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @returns Promise resolving to the response data
 * @throws {NodeApiError} When all retry attempts are exhausted
 */
async function executeWithRetry(
    context: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    options: IRequestOptions,
    maxRetries = 3,
): Promise<any> {
    let lastError: any;
    let retryCount = 0;
    const startTime = Date.now();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const responseData = await context.helpers.request!(options);

            // Log successful operation metrics
            logMetrics(context, {
                operation: 'api_request',
                endpoint: options.url || '',
                method: options.method || 'GET',
                duration: Date.now() - startTime,
                success: true,
                retryCount,
                timestamp: new Date(),
            });

            return responseData;
        } catch (error: any) {
            lastError = error;
            retryCount = attempt + 1;

            // Check if we should retry based on error type
            const statusCode = error.statusCode || error.response?.statusCode;

            // Don't retry on client errors (4xx), except for 429 (rate limit)
            if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
                throw error;
            }

            // Don't retry on the last attempt
            if (attempt === maxRetries - 1) {
                break;
            }

            // Calculate backoff delay
            let backoffDelay: number;

            if (statusCode === 429) {
                // For rate limiting, use Retry-After header if available
                const retryAfter = error.response?.headers?.['retry-after'];
                backoffDelay = retryAfter ? parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 2000;
            } else {
                // For other errors, use exponential backoff: 1s, 2s, 4s
                backoffDelay = Math.pow(2, attempt) * 1000;
            }

            // Log retry attempt
            const retryLogMessage = {
                level: 'warn',
                message: 'Retrying Bigin API request',
                endpoint: options.url,
                attempt: attempt + 1,
                maxRetries,
                backoffDelay,
                statusCode,
            };

            // Use n8n's logger if available, otherwise fall back to console
            if (hasLogger(context)) {
                context.logger.warn(retryLogMessage.message, retryLogMessage);
            } else {
                console.warn(JSON.stringify(retryLogMessage));
            }

            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
    }

    // Log failed operation metrics
    logMetrics(context, {
        operation: 'api_request',
        endpoint: options.url || '',
        method: options.method || 'GET',
        duration: Date.now() - startTime,
        success: false,
        retryCount,
        timestamp: new Date(),
    });

    // All retries exhausted, throw the last error
    throw lastError;
}

/**
 * Make an authenticated API request to Zoho Bigin CRM API with retry logic and performance monitoring.
 * Bigin API follows the CRM v2 API structure with JSON request/response format.
 *
 * **Performance Features:**
 * - Automatic retry on rate limiting (HTTP 429) with exponential backoff
 * - Retry on transient server errors (5xx) with exponential backoff
 * - Operation metrics logging for monitoring and debugging
 * - Respects Retry-After headers for rate limiting
 *
 * @param method - HTTP method (GET, POST, PUT, DELETE, etc.)
 * @param endpoint - API endpoint path (e.g., '/Pipelines', '/Contacts/{id}')
 * @param body - Request body data
 * @param qs - Query string parameters
 * @param headers - Additional headers to include in the request
 * @param additionalOptions - Additional request options (formData, encoding, json, etc.)
 * @returns Promise resolving to the API response data
 * @throws {NodeApiError} When the API request fails after all retries
 * @see https://www.zoho.com/bigin/developer/docs/api/v1/
 */
export async function zohoBiginApiRequest(
    this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
    method: IHttpRequestMethods,
    endpoint: string,
    body: IDataObject = {},
    qs: IDataObject = {},
    headers?: IDataObject,
    additionalOptions?: IDataObject,
): Promise<any> {
    const {access_token} = await getAccessTokenData.call(this);
    const credentials = await this.getCredentials('zohoApi');
    const baseUrl = getBiginBaseUrl(credentials.accessTokenUrl as string);

    const options: IRequestOptions = {
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
            Authorization: 'Zoho-oauthtoken ' + access_token,
            ...(headers || {}),
        },
        json: true,
    };

    // Handle file uploads with formData
    if (additionalOptions?.formData) {
        options.formData = additionalOptions.formData as IDataObject;
        // Remove Content-Type header for multipart/form-data (auto-set by request library)
        delete options.headers!['Content-Type'];
    } else {
        // Standard JSON content type for non-file operations
        options.headers!['Content-Type'] = 'application/json';
        if (Object.keys(body).length) {
            options.body = body;
        }
    }

    if (Object.keys(qs).length) {
        options.qs = qs;
    }

    // Handle binary downloads
    if (additionalOptions?.encoding === null) {
        options.encoding = null;
    }
    if (additionalOptions?.json === false) {
        options.json = false;
    }

    try {
        // Use retry logic for all requests
        const responseData = await executeWithRetry(this, options);

        // Don't check error status for binary downloads
        if (additionalOptions?.json !== false) {
            throwOnErrorStatus.call(this, responseData as IDataObject);
        }

        return responseData;
    } catch (error) {
        const errorData = (error as any).cause?.data;
        const args = errorData
            ? {
                message: errorData.message || 'The Zoho Bigin API returned an error.',
                description: JSON.stringify(errorData, null, 2),
            }
            : undefined;
        throw new NodeApiError(this.getNode(), error as JsonObject, args);
    }
}
