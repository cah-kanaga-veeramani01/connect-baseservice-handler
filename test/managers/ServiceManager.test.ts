import { Repository } from 'sequelize-mock';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import { createServicesResponse, servicePayload } from '../../test/TestData';
import db from '../../database/DBManager';

const serviceManager = new ServiceManager(db.getRepository(Service));

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

describe('get list of services', () => {
	test('should return list of services ', async () => {
		db.query = () => {
			return [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: "TIP",
					serviceTagName: [
						"TagA"
					],
					status: "Active"
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, '', 'Active')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					"serviceID": 1,
					"serviceName": "Automation Service 0001",
					"serviceType": "TIP",
					"serviceTagName": [
						"TagA"
					],
					"status": "Active"
				}]
		});
	});
	test('should return list of services matching the search key', async () => {
		db.query = () => {
			return [
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: "TIP",
					serviceTagName: [
						"TagA",
						"TagB"
					],
					status: "Inactive"
				}
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, 'TagB', 'Inactive')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
					"serviceID": 2,
					"serviceName": "Automation Service 0002",
					"serviceType": "TIP",
					"serviceTagName": [
						"TagA",
						"TagB"
					],
					"status": "Inactive"
				}]
		});
	});
	test('should return list of services matching status', async () => {
		db.query = () => {
			return [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: "TIP",
					serviceTagName: [
						"TagA"
					],
					status: "Active"
				},
			];
		};
		expect(await serviceManager.getServiceList('serviceName', 'asc', 0, 1, 'All', 'Active')).toMatchObject({
			totalServices: 1,
			nonFilteredServicesCount: 1,
			services: [
				{
				serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: "TIP",
					serviceTagName: [
						"TagA"
					],
					status: "Active"
				}]
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
			expect(error.code).toBe('SCE008');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});
