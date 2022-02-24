import mocks from 'node-mocks-http';
import { Service } from '../../database/models/Service';
import ServiceManager from '../../src/managers/ServiceManager';
import ServiceController from '../../src/controllers/ServiceController';
import db from '../../database/DBManager';
import { createServicesResponse, servicePayload } from '../TestData';

const serviceManager = new ServiceManager(db.getRepository(Service));
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
		await serviceController.createService(request, response, next);
		expect(response._getData()).toMatchObject(createServicesResponse);
	});
	test('should fail to create a new service', async () => {
		jest.spyOn(serviceManager, 'createService').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceController.createService(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
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
						serviceTagName: ['TagA'],
						status: 'Active'
					},
					{
						serviceID: 2,
						serviceName: 'Automation Service 0002',
						serviceType: 'TIP',
						serviceTagName: ['TagA', 'TagB'],
						status: 'Inactive'
					},
					{
						serviceID: 3,
						serviceName: 'Automation Service 0003',
						serviceType: 'CMR',
						serviceTagName: ['TagB', 'TagC'],
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
					serviceTagName: ['TagA'],
					status: 'Active'
				},
				{
					serviceID: 2,
					serviceName: 'Automation Service 0002',
					serviceType: 'TIP',
					serviceTagName: ['TagA', 'TagB'],
					status: 'Inactive'
				},
				{
					serviceID: 3,
					serviceName: 'Automation Service 0003',
					serviceType: 'CMR',
					serviceTagName: ['TagB', 'TagC'],
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
			expect(error.code).toBe('SCE008');
			expect(error.name).toBe('ServiceListFetchError');
		}
	});
});
