import type {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { zohoSubscriptionsApiRequest } from './GenericFunctions';
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
            // JSON Data field for create/update operations
            jsonDataField(
                ['product', 'plan', 'addon', 'subscription', 'invoice', 'payment', 'customer', 'item'],
                [
                    'createProduct', 'updateProduct',
                    'createPlan', 'updatePlan',
                    'createAddon', 'updateAddon',
                    'createSubscription', 'updateSubscription',
                    'createInvoice', 'updateInvoice',
                    'createPayment',
                    'createCustomer', 'updateCustomer',
                ],
            ),
        ],
    };

    async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const baseURL = 'https://www.zohoapis.eu/billing/v1';
        const items = this.getInputData();
        const returnData: IDataObject[] = [];
        for (let i = 0; i < items.length; i++) {
            const operation = this.getNodeParameter('operation', i) as string;
            const orgId = this.getNodeParameter('organizationId', i) as string;
            if (operation === 'listProducts') { // <-- Correctly checks for 'listProducts'
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/products`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/products/${productId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createProduct') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/products`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'updateProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/products/${productId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteProduct') {
                const productId = this.getNodeParameter('productId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/products/${productId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listPlans') {
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/plans`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getPlan') {
                const planId = this.getNodeParameter('planId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/plans/${planId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createPlan') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/plans`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
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
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deletePlan') {
                const planId = this.getNodeParameter('planId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/plans/${planId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listAddons') {
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/addons`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getAddon') {
                const addonId = this.getNodeParameter('addonId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/addons/${addonId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createAddon') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/addons`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
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
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteAddon') {
                const addonId = this.getNodeParameter('addonId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/addons/${addonId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listInvoices') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const customerId = this.getNodeParameter('customerId', i) as string;
                const filterBy = this.getNodeParameter('filterBy', i) as string;
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
                const page = this.getNodeParameter('page', i) as number;
                const perPage = this.getNodeParameter('perPage', i) as number;
                if (page) {
                    qs.page = page;
                }
                if (perPage) {
                    qs.per_page = perPage;
                }

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/invoices`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listSubscriptions') {
                // build optional filters and paging parameters
                const filters = this.getNodeParameter('filters', i, {filter: []}) as {
                    filter?: Array<{ filterBy: string; filterValue: string }>;
                };
                const page = this.getNodeParameter('page', i) as number;
                const perPage = this.getNodeParameter('perPage', i) as number;
                const qs: IDataObject = {};
                if (filters.filter) {
                    for (const f of filters.filter) {
                        if (f.filterValue) {
                            qs[f.filterBy] = f.filterValue;
                        }
                    }
                }
                if (page) {
                    qs.page = page;
                }
                if (perPage) {
                    qs.per_page = perPage;
                }
                const responseData = await zohoSubscriptionsApiRequest.call(
                    this,
                    'GET',
                    `${baseURL}/subscriptions`,
                    {},
                    qs,
                    orgId,
                );
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getSubscription') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/subscriptions/${subscriptionId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createSubscription') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/subscriptions`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
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
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'cancelSubscription') {
                const subscriptionId = this.getNodeParameter('subscriptionId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/subscriptions/${subscriptionId}/cancel`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getInvoice') {
                const invoiceId = this.getNodeParameter('invoiceId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/invoices/${invoiceId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteInvoice') {
                const invoiceId = this.getNodeParameter('invoiceId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/invoices/${invoiceId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createInvoice') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/invoices`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createPayment') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/payments`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getPayment') {
                const paymentId = this.getNodeParameter('paymentId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/payments/${paymentId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listPayments') {
                const page = this.getNodeParameter('page', i) as number;
                const perPage = this.getNodeParameter('perPage', i) as number;
                const qs: IDataObject = {};
                if (page) {
                    qs.page = page;
                }
                if (perPage) {
                    qs.per_page = perPage;
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/payments`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listEvents') {
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/events`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getEvent') {
                const eventId = this.getNodeParameter('eventId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/events/${eventId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listItems') {
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/items`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getItem') {
                const itemId = this.getNodeParameter('itemId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/items/${itemId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getCustomerByReference') {
                const referenceId = this.getNodeParameter('referenceId', i) as string;
                const referenceIdType = this.getNodeParameter('referenceIdType', i) as string;
                const qs = {
                    reference_id_type: referenceIdType
                } as IDataObject;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/reference/${referenceId}`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listCustomers') {
                const page = this.getNodeParameter('page', i) as number;
                const perPage = this.getNodeParameter('perPage', i) as number;
                const qs: IDataObject = {};
                if (page) {
                    qs.page = page;
                }
                if (perPage) {
                    qs.per_page = perPage;
                }


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

                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'getUnusedCredits') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}/unusedcredits`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listTransactions') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const qs: IDataObject = {customer_id: customerId};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/transactions`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'listCustomerComments') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'GET', `${baseURL}/customers/${customerId}/comments`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'createCustomer') {
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'enableAllReminders') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/paymentreminder/enable`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'stopAllReminders') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/paymentreminder/disable`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'markCustomerAsActive') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/markasactive`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'markCustomerAsInactive') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/${customerId}/markasinactive`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'bulkMarkCustomersAsActive') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/markasactive`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'bulkMarkCustomersAsInactive') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'POST', `${baseURL}/customers/markasinactive`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'updateCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const jsonData = this.getNodeParameter('jsonData', i) as string;
                let body: IDataObject;
                try {
                    body = JSON.parse(jsonData) as IDataObject;
                } catch {
                    throw new NodeOperationError(this.getNode(), 'JSON Data must be valid JSON');
                }
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'PUT', `${baseURL}/customers/${customerId}`, body, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteCustomerComment') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const commentId = this.getNodeParameter('commentId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}/comments/${commentId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteCustomerAddress') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const addressId = this.getNodeParameter('addressId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}/address/${addressId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'deleteCustomer') {
                const customerId = this.getNodeParameter('customerId', i) as string;
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers/${customerId}`, {}, {}, orgId);
                returnData.push({json: responseData as IDataObject});
            } else if (operation === 'bulkDeleteCustomers') {
                const customerIds = this.getNodeParameter('customerIds', i) as string;
                const qs: IDataObject = {customer_ids: customerIds};
                const responseData = await zohoSubscriptionsApiRequest.call(this, 'DELETE', `${baseURL}/customers`, {}, qs, orgId);
                returnData.push({json: responseData as IDataObject});
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
                returnData.push({json: responseData as IDataObject});
            } else {
                throw new NodeOperationError(this.getNode(), `Operation '${operation}' is not supported`);
            }
        }

        return [this.helpers.returnJsonArray(returnData)];
    }
}
