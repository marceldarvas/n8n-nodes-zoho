import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { getSubscriptionsBaseUrl, zohoSubscriptionsApiRequest, zohoSubscriptionsApiRequestAllItems } from './GenericFunctions';
import {
    organizationId,
    jsonDataField,
    productOperations,
    productFields,
    planOperations,
    planFields,
    addonOperations,
    addonFields,
    subscriptionOperations,
    subscriptionFields,
    invoiceOperations,
    invoiceFields,
    paymentOperations,
    paymentFields,
    customerOperations,
    customerFields,
    eventOperations,
    eventFields,
    itemOperations,
    itemFields,
} from './descriptions';

export class ZohoBilling implements INodeType {
    description: INodeTypeDescription = {
        displayName: 'Zoho Billing',
        name: 'zohoBilling',
        icon: 'file:zoho.svg',
        group: ['transform'],
        version: 1,
        subtitle: '={{$parameter["operation"]}}',
        description: 'Consume Zoho Billing (Subscriptions) API',
        defaults: {
            name: 'Zoho Billing',
        },
        inputs: [NodeConnectionTypes.Main],
        outputs: [NodeConnectionTypes.Main],
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
                    { name: 'Product', value: 'product', description: 'Operations on products' },
                    { name: 'Plan', value: 'plan', description: 'Operations on plans' },
                    { name: 'Add-on', value: 'addon', description: 'Operations on add-ons' },
                    { name: 'Subscription', value: 'subscription', description: 'Operations on subscriptions' },
                    { name: 'Invoice', value: 'invoice', description: 'Operations on invoices' },
                    { name: 'Payment', value: 'payment', description: 'Operations on payments' },
                    { name: 'Customer', value: 'customer', description: 'Operations on customers' },
                    { name: 'Event', value: 'event', description: 'Operations on events' },
                    { name: 'Item', value: 'item', description: 'Operations on items' },
                ],
                default: 'product',
            },
            // Operation definitions
            ...productOperations,
            ...planOperations,
            ...addonOperations,
            ...subscriptionOperations,
            ...invoiceOperations,
            ...paymentOperations,
            ...customerOperations,
            ...eventOperations,
            ...itemOperations,
            // Common fields
            organizationId,
            // Resource-specific fields
            ...productFields,
            ...planFields,
            ...addonFields,
            ...subscriptionFields,
            ...invoiceFields,
            ...paymentFields,
            ...customerFields,
            ...eventFields,
            ...itemFields,
            // JSON Data field for create/update operations (excluding Customer and Product which now have structured fields)
            jsonDataField(
                ['plan', 'addon', 'subscription', 'invoice', 'payment', 'item'],
                [
                    'createPlan', 'updatePlan',
                    'createAddon', 'updateAddon',
                    'createSubscription', 'updateSubscription',
                    'createInvoice', 'updateInvoice',
                    'createPayment',
                ],
            ),
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const credentials = await this.getCredentials('zohoApi');
        const baseURL = getSubscriptionsBaseUrl(credentials.accessTokenUrl as string);
        const items = this.getInputData();
        const returnData: INodeExecutionData[] = [];
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i) as string;
                const orgId = this.getNodeParameter('organizationId', i) as string;
            if (operation === 'listProducts') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/products`,
                        {},
                        {},
                        orgId,
                        'products',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/products`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.products || [];
                }

                returnData.push({json: { products: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/products/${productId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createProduct') {
                const productName = this.getNodeParameter('productName', i) as string;
                const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

                const body: IDataObject = {
                    name: productName,
                    ...additionalFields,
                };

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/products`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updateProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

                const body: IDataObject = {
                    ...additionalFields,
                };

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/products/${productId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/products/${productId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listPlans') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/plans`,
                        {},
                        {},
                        orgId,
                        'plans',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/plans`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.plans || [];
                }

                returnData.push({json: { plans: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getPlan') {
                const planId = this.getNodeParameter('planId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/plans/${planId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createPlan') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/plans`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updatePlan') {
                const planId = this.getNodeParameter('planId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/plans/${planId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deletePlan') {
                const planId = this.getNodeParameter('planId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/plans/${planId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listAddons') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/addons`,
                        {},
                        {},
                        orgId,
                        'addons',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/addons`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.addons || [];
                }

                returnData.push({json: { addons: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getAddon') {
                const addonId = this.getNodeParameter('addonId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/addons/${addonId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createAddon') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/addons`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updateAddon') {
                const addonId = this.getNodeParameter('addonId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/addons/${addonId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteAddon') {
                const addonId = this.getNodeParameter('addonId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/addons/${addonId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listInvoices') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const customerId = this.getNodeParameter('customerId', i) as string;
                const filterBy = this.getNodeParameter('filterBy', i) as string;
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                const qs: IDataObject = {};

                if (subscriptionId) {
                    qs.subscription_id = subscriptionId;
                }
                if (customerId) {
                    qs.customer_id = customerId;
                }
                if (filterBy && filterBy !== 'All') {
                    qs.filter_by = filterBy;
                }

                let responseData;
                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/invoices`,
                        {},
                        qs,
                        orgId,
                        'invoices',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    qs.per_page = limit;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/invoices`,
                        {},
                        qs,
                        orgId,
                    );
                    responseData = response.invoices || [];
                }

                returnData.push({json: { invoices: responseData }, pairedItem: { item: i }});
            } else if (operation === 'listSubscriptions') {
                // build optional filters and paging parameters
                const filters = this.getNodeParameter('filters', i, {filter: []}) as {
                    filter?: Array<{ filterBy: string; filterValue: string }>;
                };
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                const qs: IDataObject = {};

                if (filters.filter) {
                    for (const f of filters.filter) {
                        if (f.filterValue) {
                            qs[f.filterBy] = f.filterValue;
                        }
                    }
                }

                let responseData;
                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/subscriptions`,
                        {},
                        qs,
                        orgId,
                        'subscriptions',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    qs.per_page = limit;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/subscriptions`,
                        {},
                        qs,
                        orgId,
                    );
                    responseData = response.subscriptions || [];
                }

                returnData.push({json: { subscriptions: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getSubscription') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/subscriptions/${subscriptionId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createSubscription') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/subscriptions`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updateSubscription') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/subscriptions/${subscriptionId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'cancelSubscription') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/subscriptions/${subscriptionId}/cancel`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'getInvoice') {
                const invoiceId = this.getNodeParameter('invoiceId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/invoices/${invoiceId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteInvoice') {
                const invoiceId = this.getNodeParameter('invoiceId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/invoices/${invoiceId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createInvoice') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/invoices`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createPayment') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/payments`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'getPayment') {
                const paymentId = this.getNodeParameter('paymentId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/payments/${paymentId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listPayments') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/payments`,
                        {},
                        {},
                        orgId,
                        'payments',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/payments`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.payments || [];
                }

                returnData.push({json: { payments: responseData }, pairedItem: { item: i }});
            } else if (operation === 'listEvents') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/events`,
                        {},
                        {},
                        orgId,
                        'events',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/events`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.events || [];
                }

                returnData.push({json: { events: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getEvent') {
                const eventId = this.getNodeParameter('eventId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/events/${eventId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listItems') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                let responseData;

                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/items`,
                        {},
                        {},
                        orgId,
                        'items',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/items`,
                        {},
                        { per_page: limit },
                        orgId,
                    );
                    responseData = response.items || [];
                }

                returnData.push({json: { items: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getItem') {
                const itemId = this.getNodeParameter('itemId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/items/${itemId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'getCustomerByReference') {
                const referenceId = this.getNodeParameter('referenceId', i) as string;
                const referenceIdType = this.getNodeParameter('referenceIdType', i) as string;
                const qs = {
                    reference_id_type: referenceIdType
                } as IDataObject;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/reference/${referenceId}`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listCustomers') {
                const returnAll = this.getNodeParameter('returnAll', i) as boolean;
                const qs: IDataObject = {};

                // Apply any customer filters (contact number, email, custom field)
                const filters = this.getNodeParameter('filters', i, {filter: []}) as {
                    filter?: Array<{ filterBy: string; filterValue: string; customFieldId?: string }>;
                };
                if (filters.filter) {
                    for (const f of filters.filter) {
                        if (!f.filterValue) {
                            continue;
                        }
                        if (f.filterBy === 'custom_field') {
                            if (f.customFieldId) {
                                qs[`custom_field_${f.customFieldId}_contains`] = f.filterValue;
                            }
                        } else {
                            qs[f.filterBy] = f.filterValue;
                        }
                    }
                }

                let responseData;
                if (returnAll) {
                    responseData = await zohoSubscriptionsApiRequestAllItems.call(
                        this,
                        'GET',
                        `${baseURL}/customers`,
                        {},
                        qs,
                        orgId,
                        'customers',
                    );
                } else {
                    const limit = this.getNodeParameter('limit', i) as number;
                    qs.per_page = limit;
                    const response = await zohoSubscriptionsApiRequest.call(
                        this,
                        'GET',
                        `${baseURL}/customers`,
                        {},
                        qs,
                        orgId,
                    );
                    responseData = response.customers || [];
                }

                returnData.push({json: { customers: responseData }, pairedItem: { item: i }});
            } else if (operation === 'getCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'getUnusedCredits') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}/unusedcredits`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listTransactions') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const qs: IDataObject = {customer_id: customerId};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/transactions`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'listCustomerComments') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}/comments`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'createCustomer') {
                const displayName = this.getNodeParameter('displayName', i) as string;
                const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
                const billingAddress = this.getNodeParameter('billingAddress', i, {}) as { address?: IDataObject };
                const shippingAddress = this.getNodeParameter('shippingAddress', i, {}) as { address?: IDataObject };
                const customFields = this.getNodeParameter('customFields', i, { fields: [] }) as { fields?: Array<{ label: string; value: string }> };

                const body: IDataObject = {
                    display_name: displayName,
                    ...additionalFields,
                };

                if (billingAddress.address && Object.keys(billingAddress.address).length > 0) {
                    body.billing_address = billingAddress.address;
                }

                if (shippingAddress.address && Object.keys(shippingAddress.address).length > 0) {
                    body.shipping_address = shippingAddress.address;
                }

                if (customFields.fields && customFields.fields.length > 0) {
                    body.custom_fields = customFields.fields;
                }

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'enableAllReminders') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/paymentreminder/enable`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'stopAllReminders') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/paymentreminder/disable`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'markCustomerAsActive') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/markasactive`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'markCustomerAsInactive') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/markasinactive`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'bulkMarkCustomersAsActive') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/markasactive`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'bulkMarkCustomersAsInactive') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/markasinactive`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updateCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
                const billingAddress = this.getNodeParameter('billingAddress', i, {}) as { address?: IDataObject };
                const shippingAddress = this.getNodeParameter('shippingAddress', i, {}) as { address?: IDataObject };
                const customFields = this.getNodeParameter('customFields', i, { fields: [] }) as { fields?: Array<{ label: string; value: string }> };

                const body: IDataObject = {
                    ...additionalFields,
                };

                if (billingAddress.address && Object.keys(billingAddress.address).length > 0) {
                    body.billing_address = billingAddress.address;
                }

                if (shippingAddress.address && Object.keys(shippingAddress.address).length > 0) {
                    body.shipping_address = shippingAddress.address;
                }

                if (customFields.fields && customFields.fields.length > 0) {
                    body.custom_fields = customFields.fields;
                }

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/customers/${customerId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteCustomerComment') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const commentId = this.getNodeParameter('commentId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}/comments/${commentId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteCustomerAddress') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const addressId = this.getNodeParameter('addressId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}/address/${addressId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'deleteCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'bulkDeleteCustomers') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else if (operation === 'updateInvoice') {
                const invoiceId = this.getNodeParameter('invoiceId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/invoices/${invoiceId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject, pairedItem: { item: i }});
            } else {
                throw new NodeOperationError(this.getNode(), `Operation '${operation}' is not supported`);
            }
            } catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: { error: (error as Error).message },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }

        return [returnData];
    }
}
