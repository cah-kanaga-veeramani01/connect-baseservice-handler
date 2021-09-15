import { Repository } from 'sequelize-mock';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceTypeManager from '../../src/managers/ServiceTypeManager';
import { serviceTypePayload, serviceTypesResponse } from '../TestData';

const mockServiceTypeRepository: Repository<ServiceType> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceTypesResponse);
	}),
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceTypesResponse);
	})
};

const mockServiceTypeRepository_reject: Repository<ServiceType> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};
describe('Service Type - Test', () => {
	test('should create service type', async () => {
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceTypeRepository);
		expect(await serviceTypeManager.createServiceType(serviceTypePayload)).toMatchObject(serviceTypesResponse);
	});
	test('should fail to create service type', async () => {
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceTypeRepository_reject);
		try {
			await serviceTypeManager.createServiceType(serviceTypePayload);
		} catch (error) {
			expect(error.code).toEqual('SCE004');
			expect(error.name).toEqual('CreateServiceTypeError');
		}
	});
	test('should return service type list', async () => {
		const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceTypeRepository);
		expect(await serviceTypeManager.getAllServiceTypes()).toMatchObject(serviceTypesResponse);
	});
	test('should fail to fetch list', async () => {
		try {
			const serviceTypeManager: ServiceTypeManager = new ServiceTypeManager(mockServiceTypeRepository_reject);
			await serviceTypeManager.getAllServiceTypes();
		} catch (error) {
			expect(error.code).toEqual('SCE006');
			expect(error.name).toEqual('ServiceTypeFetchError');
		}
	});
});
