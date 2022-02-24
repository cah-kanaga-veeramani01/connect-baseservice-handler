import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';

const mockServiceTagMappingRepository: Repository<ServiceTagMapping> = {
	bulkCreate: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceID: 1, serviceTagID: 1 });
	})
};
const mockServiceRepository: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve(null);
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve(createServicesResponse);
	})
};

const mockServiceRepository_error: Repository<Service> = {
	create: jest.fn().mockImplementation(() => {
		return Promise.reject(new Error());
	})
};

const mockService_duplicate_error_repo: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceID: 1, serviceName: 'Service A' });
	})
};

describe('Create Service', () => {
	test('should create a service successfully ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTagMappingRepository);
		expect(await serviceManager.createService(servicePayload)).toMatchObject(createServicesResponse);
	});

	test('should fail to create a service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTagMappingRepository);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE005');
			expect(error.name).toBe('CreateServiceError');
		}
	});

	test('should fail to create a duplicate service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockService_duplicate_error_repo, mockServiceTagMappingRepository);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE008');
			expect(error.name).toBe('ServiceAlreadyExistsError');
		}
	});
});
