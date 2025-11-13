// ============================================================================
// OAuth2 Credentials
// ============================================================================

export type ZohoOAuth2ApiCredentials = {
    authUrl: string;
    accessTokenUrl: string;
    clientId: string;
    clientSecret: string;
    scope: string;
    authQueryParameters: string;
    authentication: string;
    redirectUri: string;
    oauthTokenData: {
        api_domain: string;
        access_token: string;
        refresh_token: string;
        expires_in: number; // Default 3600 seconds
    };
};

// ============================================================================
// Common API Response Patterns
// ============================================================================

/**
 * Base error response structure for Zoho APIs
 */
export interface ZohoApiError {
    code: number;
    message: string;
    details?: string;
}

/**
 * Error response with data array (used by some endpoints)
 */
export interface ZohoApiErrorData {
    status: 'error' | 'success';
    message: string;
    details?: string;
}

/**
 * Common pagination context for list responses
 */
export interface ZohoPageContext {
    page: number;
    per_page: number;
    has_more_page: boolean;
    total?: number;
    applied_filter?: string;
    sort_column?: string;
    sort_order?: string;
}

/**
 * Base structure for list responses from Zoho APIs
 */
export interface ZohoListResponse<T> {
    code: number;
    message: string;
    page_context?: ZohoPageContext;
    [key: string]: T[] | number | string | ZohoPageContext | undefined;
}

/**
 * Base structure for single entity responses
 */
export interface ZohoEntityResponse<T> {
    code: number;
    message: string;
    [key: string]: T | number | string | undefined;
}

// ============================================================================
// Zoho Subscriptions/Billing API Types
// ============================================================================

/**
 * Customer entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/customers/
 */
export interface ZohoSubscriptionsCustomer {
    customer_id: string;
    display_name: string;
    salutation?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    company_name?: string;
    phone?: string;
    mobile?: string;
    customer_type?: 'individual' | 'business';
    status?: 'active' | 'inactive' | 'crm' | 'lead' | 'prospect';
    payment_terms?: number;
    payment_terms_label?: string;
    currency_id?: string;
    currency_code?: string;
    currency_symbol?: string;
    website?: string;
    designation?: string;
    department?: string;
    created_time?: string;
    updated_time?: string;
    billing_address?: ZohoAddress;
    shipping_address?: ZohoAddress;
    custom_fields?: ZohoCustomField[];
    custom_field_hash?: Record<string, unknown>;
    notes?: string;
    balance?: number;
    unused_credits?: number;
}

/**
 * Address structure used in Zoho Subscriptions
 */
export interface ZohoAddress {
    attention?: string;
    street?: string;
    street2?: string;
    city?: string;
    state?: string;
    state_code?: string;
    zip?: string;
    country?: string;
    country_code?: string;
    fax?: string;
    phone?: string;
}

/**
 * Custom field structure
 */
export interface ZohoCustomField {
    customfield_id: string;
    label: string;
    value: string | number | boolean;
    data_type?: 'text' | 'number' | 'date' | 'boolean';
}

/**
 * Product entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/products/
 */
export interface ZohoSubscriptionsProduct {
    product_id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    product_type?: 'goods' | 'service';
    email_ids?: string[];
    item_ids?: string[];
    created_time?: string;
    updated_time?: string;
}

/**
 * Plan entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/plans/
 */
export interface ZohoSubscriptionsPlan {
    plan_id: string;
    plan_code: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    product_id?: string;
    product_name?: string;
    recurring_price?: number;
    recurring_price_formatted?: string;
    setup_fee?: number;
    setup_fee_formatted?: string;
    interval?: number;
    interval_unit?: 'days' | 'weeks' | 'months' | 'years';
    billing_cycles?: number;
    trial_period?: number;
    trial_period_unit?: 'days' | 'weeks' | 'months';
    addons?: ZohoSubscriptionsAddon[];
    created_time?: string;
    updated_time?: string;
}

/**
 * Addon entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/addons/
 */
export interface ZohoSubscriptionsAddon {
    addon_id?: string;
    addon_code: string;
    name: string;
    description?: string;
    status?: 'active' | 'inactive';
    product_id?: string;
    product_name?: string;
    pricing_scheme?: 'flat_fee' | 'per_unit' | 'tiered' | 'volume' | 'stairstep';
    price?: number;
    price_formatted?: string;
    unit_name?: string;
    type?: 'recurring' | 'one_time';
    interval?: number;
    interval_unit?: 'days' | 'weeks' | 'months' | 'years';
    created_time?: string;
    updated_time?: string;
}

/**
 * Subscription entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/subscriptions/
 */
export interface ZohoSubscriptionsSubscription {
    subscription_id: string;
    subscription_number?: string;
    name?: string;
    status: 'live' | 'future' | 'expired' | 'cancelled' | 'non_renewing' | 'trial' | 'unpaid';
    customer_id: string;
    customer_name?: string;
    customer_email?: string;
    plan_id: string;
    plan_name?: string;
    plan_code?: string;
    amount?: number;
    amount_formatted?: string;
    currency_code?: string;
    currency_symbol?: string;
    interval?: number;
    interval_unit?: 'days' | 'weeks' | 'months' | 'years';
    billing_mode?: 'auto' | 'manual' | 'offline';
    starts_at?: string;
    trial_starts_at?: string;
    trial_ends_at?: string;
    next_billing_at?: string;
    expires_at?: string;
    created_time?: string;
    updated_time?: string;
    activated_at?: string;
    cancelled_at?: string;
    addons?: Array<{
        addon_id: string;
        addon_code: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    custom_fields?: ZohoCustomField[];
    notes?: string;
    auto_collect?: boolean;
}

/**
 * Invoice entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/invoices/
 */
export interface ZohoSubscriptionsInvoice {
    invoice_id: string;
    invoice_number?: string;
    invoice_url?: string;
    status: 'sent' | 'paid' | 'overdue' | 'void' | 'draft' | 'partially_paid' | 'unpaid';
    customer_id: string;
    customer_name?: string;
    email?: string;
    subscription_id?: string;
    date?: string;
    due_date?: string;
    payment_made?: number;
    balance?: number;
    total?: number;
    total_formatted?: string;
    currency_code?: string;
    currency_symbol?: string;
    invoice_items?: ZohoInvoiceItem[];
    credits_applied?: number;
    payment_expected_date?: string;
    last_payment_date?: string;
    created_time?: string;
    updated_time?: string;
}

/**
 * Invoice item/line item
 */
export interface ZohoInvoiceItem {
    item_id?: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    discount?: number;
    tax_id?: string;
    tax_name?: string;
    tax_percentage?: number;
    item_total?: number;
}

/**
 * Payment entity from Zoho Subscriptions
 * @see https://www.zoho.com/subscriptions/api/v1/payments/
 */
export interface ZohoSubscriptionsPayment {
    payment_id: string;
    payment_number?: string;
    customer_id: string;
    customer_name?: string;
    payment_mode?: string;
    amount: number;
    amount_formatted?: string;
    date?: string;
    reference_number?: string;
    description?: string;
    currency_code?: string;
    currency_symbol?: string;
    invoices?: Array<{
        invoice_id: string;
        invoice_number: string;
        amount_applied: number;
    }>;
    created_time?: string;
    updated_time?: string;
}

/**
 * Event entity from Zoho Subscriptions (Webhooks)
 * @see https://www.zoho.com/subscriptions/api/v1/events/
 */
export interface ZohoSubscriptionsEvent {
    event_id: string;
    event_type: string;
    event_time?: string;
    data?: Record<string, unknown>;
}

/**
 * Item entity from Zoho Subscriptions
 */
export interface ZohoSubscriptionsItem {
    item_id: string;
    name: string;
    sku?: string;
    description?: string;
    rate: number;
    unit?: string;
    tax_id?: string;
    tax_name?: string;
    tax_percentage?: number;
    item_type?: 'goods' | 'service';
    product_type?: 'goods' | 'service';
    created_time?: string;
    updated_time?: string;
}

// ============================================================================
// Zoho Tasks API Types
// ============================================================================

/**
 * Task entity from Zoho Tasks
 * @see https://www.zoho.com/mail/help/api/tasks.html
 */
export interface ZohoTask {
    taskid?: string;
    name: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'none';
    status?: 'open' | 'completed' | 'inprogress';
    createdby?: string;
    createdtime?: number;
    modifiedtime?: number;
    duedate?: number;
    startdate?: number;
    completedtime?: number;
    assignee?: string;
    projectid?: string;
    projectname?: string;
    parentid?: string;
    remindertime?: number;
    remindertype?: string;
    recurrence?: ZohoTaskRecurrence;
    tags?: string[];
    subtasks?: ZohoTask[];
}

/**
 * Task recurrence settings
 */
export interface ZohoTaskRecurrence {
    frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: number;
    count?: number;
    byday?: string;
    bymonthday?: number;
}

/**
 * Project entity from Zoho Tasks
 */
export interface ZohoProject {
    projectid?: string;
    name: string;
    description?: string;
    createdby?: string;
    createdtime?: number;
    modifiedtime?: number;
    status?: string;
    color?: string;
}

/**
 * Group entity from Zoho Tasks
 */
export interface ZohoGroup {
    zgid: string;
    name: string;
    description?: string;
    membercount?: number;
    ismember?: boolean;
}

/**
 * Group member entity
 */
export interface ZohoGroupMember {
    userid: string;
    emailid: string;
    displayname?: string;
    role?: 'admin' | 'member';
}

// ============================================================================
// Zoho Email API Types
// ============================================================================

/**
 * Email send request structure for Zoho Mail
 * @see https://www.zoho.com/mail/help/api/
 */
export interface ZohoEmailSendRequest {
    fromAddress: string;
    toAddress: string;
    ccAddress?: string;
    bccAddress?: string;
    subject: string;
    content: string;
    mailFormat?: 'html' | 'plaintext';
    askReceipt?: 'yes' | 'no';
}

/**
 * Email send response from Zoho Mail
 */
export interface ZohoEmailSendResponse {
    status?: {
        code: number;
        description: string;
    };
    data?: {
        messageId?: string;
        folder?: string;
    };
}

/**
 * Email account entity
 */
export interface ZohoEmailAccount {
    accountId: string;
    accountName?: string;
    emailAddress?: string;
    displayName?: string;
}

// ============================================================================
// Zoho Sheets API Types
// ============================================================================

/**
 * Workbook entity from Zoho Sheets
 * @see https://www.zoho.com/sheet/help/api/v2/
 */
export interface ZohoWorkbook {
    workbook_id?: string;
    workbook_name: string;
    workbook_key?: string;
    created_time?: string;
    created_time_ms?: number;
    modified_time?: string;
    modified_time_ms?: number;
    owner_id?: string;
    owner_name?: string;
    resource_type?: string;
    permalink?: string;
    shared_type?: string;
}

/**
 * Worksheet entity from Zoho Sheets
 */
export interface ZohoWorksheet {
    worksheet_id?: string;
    worksheet_name: string;
    row_count?: number;
    column_count?: number;
}

/**
 * Workbook list response from Zoho Sheets
 */
export interface ZohoWorkbookListResponse {
    workbooks?: ZohoWorkbook[];
    count?: number;
    has_more?: boolean;
}

/**
 * Cell data structure for Zoho Sheets
 */
export interface ZohoSheetCell {
    row: number;
    column: number;
    value?: string | number | boolean;
    formula?: string;
}

/**
 * Range data for Zoho Sheets operations
 */
export interface ZohoSheetRange {
    workbook_id: string;
    worksheet_name: string;
    range?: string; // e.g., "A1:B10"
    data?: unknown[][];
}

// ============================================================================
// Helper Types for API Function Signatures
// ============================================================================

/**
 * Generic type for Zoho API success responses
 */
export type ZohoApiSuccessResponse<T> = {
    code: 0;
    message: string;
} & T;

/**
 * Union type for all possible API responses
 */
export type ZohoApiResponse<T> = ZohoApiSuccessResponse<T> | ZohoApiError;