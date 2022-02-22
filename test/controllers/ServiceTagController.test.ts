import mocks from 'node-mocks-http';
import db from '../../database/DBManager';
import { serviceTagsResponse, serviceTagPayload } from '../TestData';
import { ServiceTag } from '../../database/models/ServiceTag';
import ServiceClassManager from '../../src/managers/ServiceTagManager';
import ServiceTagController from '../../src/controllers/ServiceTagController';

const serviceClassManager = new ServiceClassManager(db.getRepository(ServiceTag));
const serviceTagController = new ServiceTagController(serviceClassManager);

describe('Create service classes', () => {
	const request = mocks.createRequest({
			method: 'POST',
			url: '/classes',
			body: serviceTagPayload
		}),
		response = mocks.createResponse(),
		next = jest.fn();
	test('should create service classes', async () => {
		jest.spyOn(serviceClassManager, 'createServiceTags').mockImplementation((): any => {
			return Promise.resolve(serviceTagsResponse);
		});
		await serviceTagController.createServiceTags(request, response, next);
		expect(response._getData()).toMatchObject(serviceTagsResponse);
	});
	test('should fail to create service classes', async () => {
		jest.spyOn(serviceClassManager, 'createServiceTags').mockImplementation((): any => {
			return Promise.reject();
		});
		await serviceTagController.createServiceTags(request, response, next);
		expect(next).toHaveBeenCalledTimes(1);
	});
});

// describe('GET all service classes', () => {
// 	const request = mocks.createRequest({
// 			method: 'GET',
// 			url: '/classes',
// 			query: {
// 				serviceType: 1
// 			}
// 		}),
// 		response = mocks.createResponse(),
// 		next = jest.fn();
// 	test('should return all service types', async () => {
// 		jest.spyOn(serviceClassManager, 'getAllServiceClasses').mockImplementation((): any => {
// 			return Promise.resolve(serviceClassesResponse);
// 		});
// 		await serviceClassController.getAllServiceClasses(request, response, next);
// 		expect(response._getData()).toMatchObject(serviceClassesResponse);
// 	});
// 	test('should throw error', async () => {
// 		jest.spyOn(serviceClassManager, 'getAllServiceClasses').mockImplementation((): any => {
// 			return Promise.reject();
// 		});
// 		await serviceClassController.getAllServiceClasses(request, response, next);
// 		expect(next).toHaveBeenCalledTimes(1);
// 	});
// });
