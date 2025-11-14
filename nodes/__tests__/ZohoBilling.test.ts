import { ZohoBilling } from '../ZohoBilling.node';

describe('ZohoBilling', () => {
	let zohoBilling: ZohoBilling;

	beforeEach(() => {
		zohoBilling = new ZohoBilling();
	});

	describe('Node Structure', () => {
		it('should have correct basic properties', () => {
			expect(zohoBilling.description.displayName).toBe('Zoho Billing');
			expect(zohoBilling.description.name).toBe('zohoBilling');
			expect(zohoBilling.description.group).toContain('transform');
			expect(zohoBilling.description.version).toBe(1);
		});

		it('should have correct icon', () => {
			expect(zohoBilling.description.icon).toBe('file:zoho.svg');
		});

		it('should require zohoApi credentials', () => {
			const credentials = zohoBilling.description.credentials;
			expect(credentials).toBeDefined();
			expect(credentials).toHaveLength(1);
			expect(credentials![0].name).toBe('zohoApi');
			expect(credentials![0].required).toBe(true);
		});

		it('should have correct input/output configuration', () => {
			expect(zohoBilling.description.inputs).toEqual(['main']);
			expect(zohoBilling.description.outputs).toEqual(['main']);
		});
	});

	describe('Properties Configuration', () => {
		it('should have a resource parameter', () => {
			const resourceParam = zohoBilling.description.properties.find(
				(prop) => prop.name === 'resource',
			);
			expect(resourceParam).toBeDefined();
			expect(resourceParam!.type).toBe('options');
			expect(resourceParam!.noDataExpression).toBe(true);
		});

		it('should have organizationId parameter', () => {
			const orgIdParam = zohoBilling.description.properties.find(
				(prop) => prop.name === 'organizationId',
			);
			expect(orgIdParam).toBeDefined();
			expect(orgIdParam!.type).toBe('string');
			expect(orgIdParam!.required).toBe(true);
		});

		it('should include customer resource operations', () => {
			const resourceParam = zohoBilling.description.properties.find(
				(prop) => prop.name === 'resource',
			);
			const customerOption = resourceParam!.options!.find(
				(opt: any) => opt.value === 'customer',
			);
			expect(customerOption).toBeDefined();
			expect(customerOption!.name).toBe('Customer');
		});

		it('should include product resource operations', () => {
			const resourceParam = zohoBilling.description.properties.find(
				(prop) => prop.name === 'resource',
			);
			const productOption = resourceParam!.options!.find(
				(opt: any) => opt.value === 'product',
			);
			expect(productOption).toBeDefined();
			expect(productOption!.name).toBe('Product');
		});

		it('should include subscription resource operations', () => {
			const resourceParam = zohoBilling.description.properties.find(
				(prop) => prop.name === 'resource',
			);
			const subscriptionOption = resourceParam!.options!.find(
				(opt: any) => opt.value === 'subscription',
			);
			expect(subscriptionOption).toBeDefined();
			expect(subscriptionOption!.name).toBe('Subscription');
		});
	});

	describe('Operation Parameters', () => {
		it('should have operation parameter for customer resource', () => {
			const operationParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.includes('customer'),
			);
			expect(operationParam).toBeDefined();
			expect(operationParam!.type).toBe('options');
		});

		it('should have customer operations defined', () => {
			const operationParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.includes('customer'),
			);
			expect(operationParam!.options).toBeDefined();
			expect(Array.isArray(operationParam!.options)).toBe(true);
			expect(operationParam!.options!.length).toBeGreaterThan(0);
		});

		it('should have listCustomers operation for customer resource', () => {
			const operationParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'operation' &&
					prop.displayOptions?.show?.resource?.includes('customer'),
			);
			const listOperation = operationParam!.options!.find(
				(opt: any) => opt.value === 'listCustomers',
			);
			expect(listOperation).toBeDefined();
		});
	});

	describe('Filter Parameters', () => {
		it('should have filters parameter for listCustomers operation', () => {
			const filtersParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'filters' &&
					prop.displayOptions?.show?.resource?.includes('customer') &&
					prop.displayOptions?.show?.operation?.includes('listCustomers'),
			);
			expect(filtersParam).toBeDefined();
			expect(filtersParam!.type).toBe('fixedCollection');
		});

	});

	describe('Required Fields', () => {
		it('should have customerId parameter for customer operations', () => {
			const customerIdParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'customerId' &&
					prop.displayOptions?.show?.resource?.includes('customer'),
			);
			expect(customerIdParam).toBeDefined();
		});

		it('should have productId parameter for product operations', () => {
			const productIdParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'productId' &&
					prop.displayOptions?.show?.resource?.includes('product'),
			);
			expect(productIdParam).toBeDefined();
		});

		it('should have subscriptionId parameter for subscription operations', () => {
			const subscriptionIdParam = zohoBilling.description.properties.find(
				(prop) =>
					prop.name === 'subscriptionId' &&
					prop.displayOptions?.show?.resource?.includes('subscription'),
			);
			expect(subscriptionIdParam).toBeDefined();
		});
	});

	describe('Execute Method', () => {
		it('should have an execute method', () => {
			expect(zohoBilling.execute).toBeDefined();
			expect(typeof zohoBilling.execute).toBe('function');
		});
	});
});
