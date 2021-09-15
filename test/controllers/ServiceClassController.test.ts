import mocks from 'node-mocks-http';
import db from '../../database/DBManager';
import { serviceClassesResponse, serviceClassPayload } from '../TestData';
import { ServiceClass } from '../../database/models/ServiceClass';
import ServiceClassManager from '../../src/managers/ServiceClassManager';
import ServiceClassController from '../../src/controllers/ServiceClassController';

const serviceClassManager = new ServiceClassManager(db.getRepository(ServiceClass));
const serviceClassController = new ServiceClassController(serviceClassManager);

describe('Create service classes', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/classes',
			body: serviceClassPayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create service classes', async () => {
		jest.spyOn(serviceClassManager, 'createServiceClasses').mockImplementation((): any => {
			return Promise.resolve(serviceClassesResponse);
		});
		await serviceClassController.createServiceClasses(request, response, next);
		expect(response._getData()).toMatchObject(serviceClassesResponse);
	});
	test('should fail to create service classes', async () => {
		jest.spyOn(serviceClassManager, 'createServiceClasses').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceClassController.createServiceClasses(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});

describe('GET all service classes', () => {
	const request = mocks.createRequest({
			method: 'GET',
			url: '/classes',
			query: {
				serviceType: 1
			}
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should return all service types', async () => {
		jest.spyOn(serviceClassManager, 'getAllServiceClasses').mockImplementation((): any => {
			return Promise.resolve(serviceClassesResponse);
		});
		await serviceClassController.getAllServiceClasses(request, response, next);
		expect(response._getData()).toMatchObject(serviceClassesResponse);
	});
	test('should throw error', async () => {
		jest.spyOn(serviceClassManager, 'getAllServiceClasses').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceClassController.getAllServiceClasses(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});
