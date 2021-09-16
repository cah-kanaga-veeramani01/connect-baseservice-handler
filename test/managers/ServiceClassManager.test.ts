import { Repository } from 'sequelize-mock';
import { ServiceClass } from '../../database/models/ServiceClass';
import { serviceClassesResponse, serviceClassPayload } from '../TestData';
import ServiceClassManager from '../../src/managers/ServiceClassManager';

const mockServiceClassRepository: Repository<ServiceClass> = {
	bulkCreate: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceClassesResponse);
	}),
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve(serviceClassesResponse);
	})
};

const mockServiceClassRepository_reject: Repository<ServiceClass> = {
	bulkCreate: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	}),
	findAll: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};

describe('Service Classes - Test', () => {
	test('should create service classes', async () => {
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClassRepository);
		expect(await serviceClassManager.createServiceClasses(serviceClassPayload)).toMatchObject(serviceClassesResponse);
	});
	test('should throw error', async () => {
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClassRepository_reject);
		try {
			await serviceClassManager.createServiceClasses(serviceClassPayload);
		} catch (error) {
			expect(error.code).toEqual('SCE003');
			expect(error.name).toEqual('CreateServiceClassError');
		}
	});
	test('should return classes list', async () => {
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClassRepository);
		expect(await serviceClassManager.getAllServiceClasses(1)).toMatchObject(serviceClassesResponse);
	});

	test('should fail to fetch the list', async () => {
		const serviceClassManager: ServiceClassManager = new ServiceClassManager(mockServiceClassRepository_reject);
		try {
			await serviceClassManager.getAllServiceClasses(1);
		} catch (error) {
			expect(error.code).toEqual('SCE007');
			expect(error.name).toEqual('ServiceClassFetchError');
		}
	});
});
