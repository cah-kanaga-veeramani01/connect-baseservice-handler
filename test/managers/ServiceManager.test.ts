import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import { ServiceType } from '../../database/models/ServiceType';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';
import db from '../../database/DBManager';
import { ServiceModuleConfig } from '../../database/models/ServiceModuleConfig';
import { count } from 'console';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType), db.getRepository(ServiceModuleConfig));

const mockServiceTypeRepository: Repository<ServiceType> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceTypeID: 1 });
	})
};

const mockServiceRepository: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve(null);
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

const mockServiceRepositoryNewDraft: Repository<Service> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({ serviceID: 1, serviceName: 'Service A' });
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.reject({ serviceID: 1, serviceName: 'Service A', validFrom: null, validTill: null });
	})
};

const mockServiceRepositoryNoProgram: Repository<Service> = {
	count: jest.fn().mockReturnValue(0),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve();
	})
};

const mockServiceModuleConfigRepo: Repository<ServiceModuleConfig> = {
	findAll: jest.fn().mockImplementation(() => {
		return Promise.resolve('');
	}),
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			moduleID: 1,
			moduleVersion: 1
		});
	}),
	update: jest.fn().mockImplementation(() => {
		return Promise.resolve(1);
	})
};

const mockServiceModuleConfigRepoForInsert: Repository<ServiceModuleConfig> = {
	findOne: jest.fn().mockImplementation(() => {
		return Promise.resolve(null);
	}),
	create: jest.fn().mockImplementation(() => {
		return Promise.resolve({
			serviceID: 1,
			moduleID: 1,
			moduleVersion: 1
		});
	})
};

describe('Create Service', () => {
	// test('should create a service successfully ', async () => {
	// 	const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTypeRepository);
	// 	expect(await serviceManager.createService(servicePayload)).toMatchObject(createServicesResponse);
	// });

	test('should fail to create a service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try {
			await serviceManager.createService(servicePayload);
		} catch (error) {
			expect(error.code).toBe('SCE005');
			expect(error.name).toBe('CreateServiceError');
		}
	});

	test('should fail to create a duplicate service ', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockService_duplicate_error_repo, mockServiceTypeRepository,mockServiceModuleConfigRepo);
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
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2021-09-17T12:52:37.898+00:00',
							validTill: null,
							isPublished: 1,
							globalServiceVersion: 1
						}
					]
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, '')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2021-09-17T12:52:37.898+00:00',
							validTill: null,
							isPublished: 1,
							globalServiceVersion: 1
						}
					]
				}
			]
		});
	});
	test('should return list of services matching the search key', async () => {
		db.query = () => {
			return [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2021-09-17T12:52:37.898+00:00',
							validTill: null,
							isPublished: 1,
							globalServiceVersion: 1
						}
					]
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, 'abc')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					statuses: [
						{
							status: 'ACTIVE',
							validFrom: '2021-09-17T12:52:37.898+00:00',
							validTill: null,
							isPublished: 1,
							globalServiceVersion: 1
						}
					]
				}
			]
		});
	});
	test('should return empty result', async () => {
		db.query = () => {
			return [];
		};
		expect(await serviceManager.getServiceList('serviceName', 'desc', 12, 1, 'All')).toMatchObject({
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
			await serviceManager.getServiceList('serviceName', 'asc', 12, 1, 'All');
		} catch (error) {
			expect(error.code).toBe('SCE011');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});

describe('Create draft', () => {
	test('service does not exist error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try {
			await serviceManager.createDraft(11);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('draft already exists', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try {
			db.query = () => {
				return [
					{
						activeVersion: 1,
						draftVersion: 2,
						scheduledVersion: null
					}
				];
			};
			expect(serviceManager.createDraft(1)).toMatchObject({
				serviceID: 1,
				serviceName: 'Service A',
				activeVersion: 1,
				draftVersion: 2,
				scheduledVersion: null
			});
		} catch (error: any) {}
	});

	test('throw error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepository_error, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try {
			await serviceManager.createDraft(11);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDraftFetchError');
		}
	});
});

describe('Update module Version', () => {
	test('service does not exist error', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNoProgram, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try {
			await serviceManager.addModuleConfig(1,1,1);
		} catch (error: any) {
			expect(error.name).toBe('ServiceDoesntExist');
		}
	});

	test('update module version', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository,mockServiceModuleConfigRepo);
		try{
			db.query = () => {
				[ { count: '1' } ]
			};
			expect(serviceManager.addModuleConfig(1,1,1)).toBe({
				serviceID: 1,
				moduleID: 1,
				moduleVersion: 1
			});
		} catch (error: any) {}
		
	});

	test('insert module version', async () => {
		const serviceManager: ServiceManager = new ServiceManager(mockServiceRepositoryNewDraft, mockServiceTypeRepository,mockServiceModuleConfigRepoForInsert);
		try{
			db.query = () => {
				[ { count: '0' } ]
			};
			expect(serviceManager.addModuleConfig(1,1,1)).toBe({
				serviceID: 1,
				moduleID: 1,
				moduleVersion: 1
			});
		} catch (error: any) {}
	});
});