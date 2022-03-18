import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import { ServiceTag } from '../../database/models/ServiceTag';
import { ServiceTagMapping } from '../../database/models/ServiceTagMapping';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';
import db from '../../database/DBManager';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceTagMapping), db.getRepository(ServiceType), db.getRepository(ServiceTag));

const mockServiceTagRepository: Repository<ServiceTag> = {
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve([{ serviceTagMappingID: 1 }]);
	})
};
const mockServiceTypeRepository: Repository<ServiceType> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceTypeID: 1 });
	})
};

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
	// test('should create a service successfully ', async () => {
	// 	const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTagMappingRepository, mockServiceTagRepository, mockServiceTypeRepository);
	// 	expect(await serviceManager.createService(servicePayload)).toMatchObject(createServicesResponse);
	// });

	test('should fail to create a service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTagMappingRepository, mockServiceTagRepository, mockServiceTypeRepository);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE005');
			expect(error.name).toBe('CreateServiceError');
		}
	});

	test('should fail to create a duplicate service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockService_duplicate_error_repo, mockServiceTagMappingRepository, mockServiceTagRepository, mockServiceTypeRepository);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE008');
			expect(error.name).toBe('ServiceAlreadyExistsError');
		}
	});
});

describe('get list of services', () => {
	test('should return list of services ', async () => {
		db.query = () => {
			return [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					serviceTagName: ['TagA'],
					status: 'Active'
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, '', 'Active')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					serviceTagName: ['TagA'],
					status: 'Active'
				}
			]
		});
	});
	test('should return list of services matching the search key', async () => {
		db.query = () => {
			return [
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: 'TIP',
					serviceTagName: ['TagA', 'TagB'],
					status: 'Inactive'
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, 'TagB', 'Inactive')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: 'TIP',
					serviceTagName: ['TagA', 'TagB'],
					status: 'Inactive'
				}
			]
		});
	});
	test('should return list of services matching status', async () => {
		db.query = () => {
			return [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					serviceTagName: ['TagA'],
					status: 'Active'
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, 'All', 'Active')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					serviceTagName: ['TagA'],
					status: 'Active'
				}
			]
		});
	});
	test('should return empty result', async () => {
		db.query = () => {
			return [];
		};
		expect(await serviceManager.getServiceList('serviceName', 'desc', 12, 1, 'All', 'Active')).toMatchObject({
			totalServices: 0,
			nonFilteredServicesCount: 0,
			services: []
		});
	});

	test('should throw error', async () => {
		db.query = () => {
			throw new Error();
		};
		try {
			await serviceManager.getServiceList('serviceName', 'asc', 12, 1, 'All', 'All');
		} catch (error) {
			expect(error.code).toBe('SCE011');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});
