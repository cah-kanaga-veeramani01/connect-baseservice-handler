import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import ServiceController from '../../src/controllers/ServiceController';
import db from '../../database/DBManager';
import { createServicesResponse, servicePayload } from '../TestData';
import { ServiceType } from '../../database/models/ServiceType';

const serviceManager = new ServiceManager(db.getRepository(Service), db.getRepository(ServiceType));
const serviceController = new ServiceController(serviceManager);

describe('Create a new service', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/',
			body: servicePayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.resolve(createServicesResponse);
		});
		await serviceController.createService(request, response);
		expect(response._getData()).not.toBe(null);
	});
	test('should fail to create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.reject(new Error());
		});
		try {
			await serviceController.createService(request, response);
		} catch (error) {
			expect(error.code).toBe('CreateServiceError');
		}
	});
});

describe('get list of policies', () => {
	test('should return list of policies', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.resolve({
				totalServices: 3,
				nonFilteredServicesCount: 3,
				services: [
					{
						serviceID: 1,
						serviceName: 'Automation Service 0001',
						serviceType: 'TIP',
						status: 'Active'
					},
					{
						serviceID: 2,
						serviceName: 'Automation Service 0002',
						serviceType: 'TIP',
						status: 'Inactive'
					},
					{
						serviceID: 3,
						serviceName: 'Automation Service 0003',
						serviceType: 'CMR',
						status: 'Inactive'
					}
				]
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					sortBy: 'serviceName',
					sortOrder: 'asc',
					from: 0,
					limit: 1,
					statusFilter: 'All',
					keyword: ''
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		await serviceController.getServiceList(req, res);
		expect(res._getData()).toMatchObject({
			totalServices: 3,
			nonFilteredServicesCount: 3,
			services: [
				{
					serviceID: 1,
					serviceName: 'Automation Service 0001',
					serviceType: 'TIP',
					status: 'Active'
				},
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: 'TIP',
					status: 'Inactive'
				},
				{
					serviceID: 3,
					serviceName: 'Automation Service 0003',
					serviceType: 'CMR',
					status: 'Inactive'
				}
			]
		});
	});
	test('should return empty result', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.resolve({
				totalServices: 0,
				nonFilteredServicesCount: 0,
				services: []
			});
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					from: 12,
					keyword: 'test'
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		try {
			await serviceController.getServiceList(req, res);
		} catch (error) {}
		expect(res._getData()).toMatchObject({
			totalServices: 0,
			nonFilteredServicesCount: 0,
			services: []
		});
	});
	test('should return error', async () => {
		jest.spyOn(serviceManager, 'getServiceList').mockImplementation(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'GET',
				url: '/list',
				query: {
					sortBy: 'serviceName',
					sortOrder: 'asc',
					from: '10',
					limit: 1
				}
			}),
			res = mocks.createResponse(),
			next = jest.fn();
		try {
			await serviceController.getServiceList(req, res);
		} catch (error) {
			expect(error.code).toBe('SCE011');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});

describe('create draft', () => {
	test('return the draft version', async () => {
		jest.spyOn(serviceManager, 'createDraft').mockImplementation(() => {
			return Promise.resolve({
				activeVersion: 1,
				scheduledVersion: null,
				draftVersion: 2,
				serviceID: 4,
				serviceName: 'Test 4'
			});
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/draft',
				body: {
					serviceID: 4
				}
			}),
			res = mocks.createResponse();

		await serviceController.createDraft(req, res);
		expect(res._getJSONData()).toMatchObject({
			activeVersion: 1,
			scheduledVersion: null,
			draftVersion: 2,
			serviceID: 4,
			serviceName: 'Test 4'
		});
	});

	test('should return error', async () => {
		jest.spyOn(serviceManager, 'createDraft').mockImplementation(() => {
			return Promise.reject(new Error());
		});
		const req = mocks.createRequest({
				method: 'POST',
				url: '/draft',
				body: {
					serviceID: 1
				}
			}),
			res = mocks.createResponse();

		try {
			await serviceController.createDraft(req, res);
		} catch (error) {
			expect(error.name).toBe('ServiceDraftFetchError');
		}
	});
});
