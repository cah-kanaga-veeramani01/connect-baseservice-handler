import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';

const mockServiceRepository: Repository<Service> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve(createServicesResponse);
	})
};

const mockServiceRepository_error: Repository<Service> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};

describe('Create Service', () => {
	test('should create a service successfully ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository);
		expect(await serviceManager.createService(servicePayload)).toMatchObject(createServicesResponse);
	});

	test('should fail to create a service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE005');
			expect(error.name).toBe('CreateServiceError');
		}
	});
});
